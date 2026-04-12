import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { ADMIN_WALLET } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiChevronDown, FiZap } from 'react-icons/fi';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { to: '/explore', label: 'Explore' },
  { to: '/governance', label: 'Governance' },
];

const DropItem = ({ to, label, accent, onClick }) => {
  const colorClass =
    accent === 'yellow' ? 'text-yellow-400 hover:bg-yellow-500/10' :
    accent === 'purple' ? 'text-primary-400 hover:bg-primary-500/10' :
    'text-gray-300 hover:bg-white/6';
  return (
    <Link to={to} onClick={onClick} className={`block px-4 py-2 text-sm rounded-lg mx-1 transition-colors ${colorClass}`}>
      {label}
    </Link>
  );
};

const MobileLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/6 rounded-xl transition-colors"
  >
    {label}
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { walletAddress, isConnected, disconnectWallet, connectWallet } = useWallet();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const normalizedWalletAddress =
    typeof walletAddress === 'string'
      ? walletAddress
      : walletAddress?.publicKey || walletAddress?.address || walletAddress?.walletAddress || '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleDisconnect = () => {
    disconnectWallet();
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isAdmin =
    user?.role === 'admin' ||
    normalizedWalletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();

  const shortAddr = normalizedWalletAddress
    ? `${normalizedWalletAddress.slice(0, 4)}…${normalizedWalletAddress.slice(-4)}`
    : 'Connected';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 pt-4">

      {/* ── Pill Container ── */}
      <div
        className="max-w-6xl mx-auto rounded-full flex items-center justify-between px-5 py-2.5 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(11,15,26,0.88)' : 'rgba(11,15,26,0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: scrolled
            ? '0 16px 40px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(124,77,255,0.18), inset 0 1px 0 rgba(255,255,255,0.07)'
            : '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* ── Logo (text only) ── */}
        <Link to="/" className="flex items-center group flex-shrink-0">
          <span className="text-xl font-bold text-white tracking-tight group-hover:opacity-90 transition-opacity">
            Invest<span className="gradient-text">X</span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <div className="hidden md:flex items-center space-x-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith(l.to)
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/6'
              }`}
            >
              {location.pathname.startsWith(l.to) && (
                <motion.span
                  layoutId="activeNavPill"
                  className="absolute inset-0 rounded-full -z-10"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── Desktop right side ── */}
        <div className="hidden md:flex items-center space-x-2.5">
          {!isConnected ? (
            <>
              <Link
                to="/raise-funds"
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-3.5 py-2 rounded-full hover:bg-white/6"
              >
                Raise Funds
              </Link>
              <button
                onClick={connectWallet}
                className="flex items-center space-x-1.5 rounded-full text-sm font-semibold px-5 py-2 text-white transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #7C4DFF 0%, #00C6FF 100%)',
                  boxShadow: '0 4px 18px rgba(124,77,255,0.5)',
                }}
              >
                <FiZap size={13} />
                <span>Connect Wallet</span>
              </button>
            </>
          ) : (
            <>
              <div
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-mono text-gray-300"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse flex-shrink-0" />
                <span>{shortAddr}</span>
              </div>
              <NotificationBell />
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm text-gray-300 hover:text-white transition-all hover:bg-white/6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <FiUser size={14} />
                  <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                  <FiChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 rounded-2xl py-2 border border-white/10"
                      style={{
                        background: 'rgba(13,17,30,0.96)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      }}
                    >
                      {isAdmin ? (
                        <DropItem to="/admin" label="Admin Panel" onClick={() => setDropdownOpen(false)} />
                      ) : (
                        <>
                          <DropItem to="/dashboard/investor" label="My Portfolio" onClick={() => setDropdownOpen(false)} />
                          <DropItem to="/dividends" label="Dividend History" onClick={() => setDropdownOpen(false)} />
                          <DropItem to="/governance/my-votes" label="My Votes" onClick={() => setDropdownOpen(false)} />
                          {user?.kycStatus !== 'verified' && (
                            <DropItem to="/kyc" label="Complete KYC ⚡" accent="yellow" onClick={() => setDropdownOpen(false)} />
                          )}
                          <div className="my-1 mx-3 h-px bg-white/8" />
                          <DropItem to="/raise-funds" label="Raise Funds" accent="purple" onClick={() => setDropdownOpen(false)} />
                          {user?.role === 'business_owner' && (
                            <>
                              <DropItem to="/dashboard/business" label="My Businesses" onClick={() => setDropdownOpen(false)} />
                              <DropItem to="/apply-funding" label="Apply for Funding" onClick={() => setDropdownOpen(false)} />
                            </>
                          )}
                        </>
                      )}
                      <div className="my-1 mx-3 h-px bg-white/8" />
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
                      >
                        <FiLogOut size={14} />
                        <span>Disconnect</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {/* ── Mobile burger ── */}
        <button
          className="md:hidden text-gray-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/6"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu (drops below pill) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto mt-2 rounded-3xl border border-white/8 overflow-hidden"
            style={{
              background: 'rgba(11,15,26,0.96)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
            }}
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((l) => (
                <MobileLink key={l.to} to={l.to} label={l.label} onClick={() => setMobileOpen(false)} />
              ))}
              <div className="pt-2 border-t border-white/8 space-y-2">
                {!isConnected ? (
                  <>
                    <Link
                      to="/raise-funds"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/6 rounded-xl transition-colors"
                    >
                      Raise Funds
                    </Link>
                    <button
                      onClick={() => { connectWallet(); setMobileOpen(false); }}
                      className="w-full rounded-full text-sm font-semibold py-2.5 text-white flex items-center justify-center space-x-2 transition-all hover:brightness-110"
                      style={{
                        background: 'linear-gradient(135deg, #7C4DFF 0%, #00C6FF 100%)',
                        boxShadow: '0 4px 18px rgba(124,77,255,0.4)',
                      }}
                    >
                      <FiZap size={14} />
                      <span>Connect Wallet</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="px-3 py-2 rounded-xl text-sm font-mono text-gray-400 flex items-center space-x-2"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <span className="w-2 h-2 rounded-full bg-teal-400 flex-shrink-0" />
                      <span className="truncate">{shortAddr}</span>
                    </div>
                    {isAdmin ? (
                      <MobileLink to="/admin" label="Admin Panel" onClick={() => setMobileOpen(false)} />
                    ) : (
                      <>
                        <MobileLink to="/dashboard/investor" label="My Portfolio" onClick={() => setMobileOpen(false)} />
                        <MobileLink to="/dividends" label="Dividend History" onClick={() => setMobileOpen(false)} />
                        <MobileLink to="/governance/my-votes" label="My Votes" onClick={() => setMobileOpen(false)} />
                        {user?.kycStatus !== 'verified' && (
                          <MobileLink to="/kyc" label="Complete KYC ⚡" onClick={() => setMobileOpen(false)} />
                        )}
                        <MobileLink to="/raise-funds" label="Raise Funds" onClick={() => setMobileOpen(false)} />
                        {user?.role === 'business_owner' && (
                          <MobileLink to="/dashboard/business" label="My Businesses" onClick={() => setMobileOpen(false)} />
                        )}
                      </>
                    )}
                    <button
                      onClick={() => { handleDisconnect(); setMobileOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/8 rounded-xl flex items-center space-x-2 transition-colors"
                    >
                      <FiLogOut size={14} />
                      <span>Disconnect</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
