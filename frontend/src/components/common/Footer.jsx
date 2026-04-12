import React from "react";
import { Link } from "react-router-dom";
import { FiExternalLink, FiGithub, FiTwitter, FiZap } from "react-icons/fi";

const LINKS = {
  platform: [
    { to: "/explore", label: "Explore Businesses" },
    { to: "/governance", label: "Governance" },
    { to: "/raise-funds", label: "Raise Funds" },
  ],
  investors: [
    { to: "/dashboard/investor", label: "My Portfolio" },
    { to: "/dividends", label: "Dividend History" },
    { to: "/kyc", label: "Complete KYC" },
  ],
  resources: [
    { href: "https://stellar.expert/explorer/testnet", label: "Block Explorer", external: true },
    { href: "https://developers.stellar.org", label: "Stellar Docs", external: true },
  ],
};

const Footer = () => (
  <footer className="relative mt-auto overflow-hidden" style={{ background: '#05070D', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    {/* Subtle glow */}
    <div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full"
      style={{ background: 'radial-gradient(ellipse, rgba(124,77,255,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
    />

    <div className="section-container py-14 relative z-10">
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/" className="inline-flex items-center mb-4 group">
            <span className="text-xl font-bold text-white group-hover:opacity-90 transition-opacity">Invest<span className="gradient-text">X</span></span>
          </Link>
          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            Community-powered micro-investment in local businesses, powered by Stellar blockchain smart contracts.
          </p>
          <div className="flex items-center space-x-3">
            <SocialBtn href="https://github.com/anindhabiswas25" icon={<FiGithub size={15} />} />
            <SocialBtn href="https://x.com/AnindhaBiswas" icon={<FiTwitter size={15} />} />
          </div>
        </div>

        {/* Link columns */}
        <FooterCol title="Platform" links={LINKS.platform} />
        <FooterCol title="Investors" links={LINKS.investors} />
        <FooterCol title="Resources" links={LINKS.resources} />
      </div>

      {/* Divider */}
      <div className="divider-glow mb-6" />

      {/* Bottom row */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} InvestX. Built on{" "}
          <span className="gradient-text font-medium">Stellar Blockchain</span>.
        </p>
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <FiZap size={11} className="text-primary-500" />
          <span>Powered by Soroban Smart Contracts</span>
        </div>
      </div>
    </div>
  </footer>
);

const FooterCol = ({ title, links }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">{title}</h4>
    <ul className="space-y-2.5">
      {links.map((l) =>
        l.external ? (
          <li key={l.label}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center space-x-1 group"
            >
              <span>{l.label}</span>
              <FiExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </li>
        ) : (
          <li key={l.label}>
            <Link to={l.to} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              {l.label}
            </Link>
          </li>
        )
      )}
    </ul>
  </div>
);

const SocialBtn = ({ href, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 glass rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:border-primary-500/40 transition-all duration-200"
  >
    {icon}
  </a>
);

export default Footer;

