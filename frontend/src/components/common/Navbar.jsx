import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { ADMIN_WALLET } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { walletAddress, isConnected, disconnectWallet, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const normalizedWalletAddress = typeof walletAddress === 'string'
    ? walletAddress
    : walletAddress?.publicKey || walletAddress?.address || walletAddress?.walletAddress || '';

  const handleDisconnect = () => {
    disconnectWallet();
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isAdmin = user?.role === 'admin' || normalizedWalletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IX</span>
            </div>
            <span className="text-xl font-bold text-gray-900">InvestX</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/explore" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Explore
            </Link>
            <Link to="/governance" className="text-gray-600 hover:text-primary-600 px-3 py-2 text-sm font-medium">
              Governance
            </Link>

            {/* Freighter Connect Button */}
            {!isConnected ? (
              <button 
                onClick={connectWallet} 
                className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
              >
                Connect Freighter
              </button>
            ) : (
              <>
                <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 border flex items-center shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  {normalizedWalletAddress ? `${normalizedWalletAddress.slice(0, 4)}...${normalizedWalletAddress.slice(-4)}` : 'Connected'}
                </div>

                {/* Notification Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-1 text-gray-700 px-3 py-2 text-sm font-medium hover:text-primary-600">
                    <FiUser />
                    <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                    <FiChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-1 z-50">
                      {isAdmin ? (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Panel</Link>
                      ) : (
                        <>
                          <Link to="/dashboard/investor" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Portfolio</Link>
                          <Link to="/dividends" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dividend History</Link>
                          <Link to="/governance/my-votes" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Votes</Link>
                          {user?.kycStatus !== 'verified' && (
                            <Link to="/kyc" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-yellow-600 font-medium hover:bg-yellow-50">Complete KYC ⚡</Link>
                          )}
                          <hr className="my-1" />
                          <Link to="/raise-funds" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50">
                            Want to Raise Funds?
                          </Link>
                          {user?.role === 'business_owner' && (
                            <>
                              <Link to="/dashboard/business" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Businesses</Link>
                              <Link to="/apply-funding" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Apply for Funding</Link>
                            </>
                          )}
                        </>
                      )}
                      <hr className="my-1" />
                      <button onClick={handleDisconnect} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                        <FiLogOut /> <span>Disconnect</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-4 pb-4">
          <Link to="/explore" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>Explore</Link>
          {!isConnected ? (
            <div className="py-2">
              <button 
                onClick={() => { connectWallet(); setMobileOpen(false); }} 
                className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Connect Freighter
              </button>
            </div>
          ) : (
            <>
              <div className="py-2 px-3 bg-gray-50 rounded-lg text-sm font-mono text-gray-700 mb-2">
                {normalizedWalletAddress ? `${normalizedWalletAddress.slice(0, 8)}...${normalizedWalletAddress.slice(-8)}` : 'Connected'}
              </div>
              {isAdmin ? (
                <Link to="/admin" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
              ) : (
                <>
                  <Link to="/dashboard/investor" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>My Portfolio</Link>
                  <Link to="/dividends" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>Dividends</Link>
                  <Link to="/governance" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>Governance</Link>
                  <Link to="/governance/my-votes" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>My Votes</Link>
                  {user?.kycStatus !== 'verified' && (
                    <Link to="/kyc" className="block py-2 text-yellow-600 font-medium" onClick={() => setMobileOpen(false)}>Complete KYC ⚡</Link>
                  )}
                  <Link to="/raise-funds" className="block py-2 text-primary-600 font-medium" onClick={() => setMobileOpen(false)}>Raise Funds</Link>
                  {user?.role === 'business_owner' && (
                    <Link to="/dashboard/business" className="block py-2 text-gray-600" onClick={() => setMobileOpen(false)}>My Businesses</Link>
                  )}
                </>
              )}
              <button onClick={() => { handleDisconnect(); setMobileOpen(false); }} className="block py-2 text-red-600">Disconnect</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
