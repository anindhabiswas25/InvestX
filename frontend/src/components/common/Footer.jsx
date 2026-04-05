import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="text-white font-bold text-lg">InvestX</span>
          <p className="text-sm mt-1">
            Community-powered micro-investment in local businesses on Stellar
          </p>
        </div>
        <div className="flex space-x-6 text-sm">
          <Link to="/" className="hover:text-white">
            Home
          </Link>
          <Link to="/explore" className="hover:text-white">
            Explore
          </Link>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            Block Explorer
          </a>
        </div>
      </div>
      <div className="mt-6 border-t border-gray-800 pt-4 text-center text-xs">
        &copy; {new Date().getFullYear()} InvestX. Built on Stellar Blockchain.
      </div>
    </div>
  </footer>
);

export default Footer;
