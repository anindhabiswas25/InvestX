const crypto = require('crypto');
const DividendRecord = require('../models/DividendRecord');
const Business = require('../models/Business');
const User = require('../models/User');
const stellarService = require('./stellar.service');

const canonicalWalletAddress = (walletAddress) => {
  if (typeof walletAddress !== 'string') return '';
  const normalized = walletAddress.trim();
  if (!normalized) return '';
  if (/^[gG][a-zA-Z2-7]{55}$/.test(normalized)) return normalized.toUpperCase();
  if (/^0x[a-fA-F0-9]{40}$/.test(normalized)) return normalized.toLowerCase();
  return normalized;
};

// Contract ID from environment
const DIVIDEND_DISTRIBUTOR_ADDRESS = process.env.DIVIDEND_CONTRACT_ID;

/**
 * Get business hash for on-chain mapping
 * Using SHA-256 hash for Stellar/Soroban compatibility
 */
const getBusinessHash = (businessId) => {
  return crypto.createHash('sha256').update(businessId.toString()).digest('hex');
};

/**
 * Calculate investor shares (basis points out of 10000)
 * based on current on-chain token holdings.
 */
const calculateInvestorShares = async (businessId) => {
  const business = await Business.findById(businessId);
  if (!business) throw new Error('Business not found');
  if (!business.tokenDetails?.contractAddress) {
    throw new Error('Business has no token contract');
  }

  // Get all users with wallets and check their on-chain token balances
  const users = await User.find({ 
    walletAddress: { $exists: true, $ne: null } 
  }).lean();

  const investorMap = {};
  let totalTokens = 0;

  for (const user of users) {
    try {
      const balance = await stellarService.getBusinessTokenBalance(
        business.tokenDetails.contractAddress,
        user.walletAddress
      );
      
      const tokens = Number(balance);
      if (tokens > 0) {
        const canonicalWallet = canonicalWalletAddress(user.walletAddress);
        if (!canonicalWallet) continue;
        investorMap[canonicalWallet] = {
          wallet: canonicalWallet,
          tokens, 
          userId: user._id 
        };
        totalTokens += tokens;
      }
    } catch (err) {
      // Skip users with balance check errors
    }
  }

  if (totalTokens === 0) throw new Error('No investors with tokens found');

  const investors = [];
  const shares = [];
  const userIds = [];

  for (const key of Object.keys(investorMap)) {
    const entry = investorMap[key];
    const basisPoints = Math.floor((entry.tokens / totalTokens) * 10000);
    if (basisPoints > 0) {
      investors.push(entry.wallet);
      shares.push(basisPoints);
      userIds.push(entry.userId);
    }
  }

  return { investors, shares, userIds, totalTokens };
};

/**
 * After governance vote passes for a REVENUE_VERIFICATION proposal:
 * Distribute XLM dividends to investors.
 * 
 * Note: This is a simplified implementation that sends XLM directly.
 * A full implementation would use the DividendDistributor contract.
 */
const distributeAfterVote = async (businessId, depositIndex) => {
  try {
    const { investors, shares, userIds, totalTokens } = await calculateInvestorShares(businessId);
    
    // Get the dividend record for the total pool amount
    const divRecord = await DividendRecord.findOne({
      businessId,
      dividendDepositIndex: depositIndex,
      status: 'pending'
    });
    
    if (!divRecord) {
      throw new Error('Dividend record not found');
    }

    console.log(`💰 Distributing dividend for business ${businessId}: ${investors.length} investors`);

    const totalPoolINR = Number(divRecord.totalDividendPool || 0);
    const totalPoolXLM = Number(divRecord.totalDividendPoolXLM || 0);
    if (totalPoolXLM <= 0) {
      throw new Error('Dividend pool XLM amount must be greater than 0');
    }
    const results = [];

    // Distribute to each investor based on their share
    for (let i = 0; i < investors.length; i++) {
      const shareRatio = shares[i] / 10000;
      const payoutXLM = Number((totalPoolXLM * shareRatio).toFixed(6));
      const payoutINR = Number((totalPoolINR * shareRatio).toFixed(2));
      
      if (payoutXLM > 0) {
        try {
          const tx = await stellarService.sendXLM(investors[i], payoutXLM.toFixed(6), 'DIV:' + businessId);
          results.push({
            investorId: userIds[i],
            walletAddress: investors[i],
            tokensPurchased: Math.max(0, Math.floor((shares[i] / 10000) * totalTokens)),
            payoutAmountINR: payoutINR,
            payoutAmountXLM: payoutXLM,
            txHash: tx.txHash,
            success: true
          });
        } catch (err) {
          console.error(`Failed to send dividend to ${investors[i]}:`, err.message);
          results.push({
            investorId: userIds[i],
            walletAddress: investors[i],
            tokensPurchased: Math.max(0, Math.floor((shares[i] / 10000) * totalTokens)),
            payoutAmountINR: payoutINR,
            payoutAmountXLM: payoutXLM,
            txHash: null,
            success: false,
          });
        }
      }
    }

    if (results.length === 0) {
      throw new Error('No eligible investor payouts generated for this distribution');
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Dividend distributed to ${successCount}/${investors.length} investors`);

    return {
      success: true,
      txHash: results.find((r) => r.success && r.txHash)?.txHash || null,
      investorCount: successCount,
      results
    };
  } catch (error) {
    console.error('distributeAfterVote error:', error);
    throw error;
  }
};

/**
 * After governance vote rejects a REVENUE_VERIFICATION proposal:
 * Mark deposit as rejected.
 */
const rejectAfterVote = async (businessId, depositIndex) => {
  try {
    console.log(`❌ Distribution rejected for ${businessId}`);
    
    // In a full implementation, this would call the contract to return funds
    // For now, just log the rejection
    
    return { success: true, txHash: null };
  } catch (error) {
    console.error('rejectAfterVote error:', error);
    throw error;
  }
};

/**
 * Get locked funds for a business.
 * This would query the DividendDistributor contract.
 */
const getLockedFunds = async (businessId) => {
  // TODO: Implement actual contract query
  return '0';
};

/**
 * Get deposit count for a business.
 */
const getDepositCount = async (businessId) => {
  const count = await DividendRecord.countDocuments({ businessId });
  return count;
};

module.exports = {
  getBusinessHash,
  calculateInvestorShares,
  distributeAfterVote,
  rejectAfterVote,
  getLockedFunds,
  getDepositCount,
  DIVIDEND_DISTRIBUTOR_ADDRESS,
};
