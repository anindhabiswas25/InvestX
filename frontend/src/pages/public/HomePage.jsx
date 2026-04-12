import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllBusinesses } from "../../services/business.api";
import { useWallet } from "../../hooks/useWallet";
import BusinessCard from "../../components/business/BusinessCard";
import SuccessStories from "../../components/common/SuccessStories";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AnimatedSection from "../../components/ui/AnimatedSection";
import GlowCard from "../../components/ui/GlowCard";
import BackgroundOrbs from "../../components/ui/BackgroundOrbs";
import {
  FiSearch,
  FiDollarSign,
  FiTrendingUp,
  FiZap,
  FiShield,
  FiGlobe,
  FiLink,
  FiArrowRight,
  FiCheckCircle,
  FiLock,
  FiCpu,
  FiPieChart,
} from "react-icons/fi";

/* ── Data ─────────────────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    icon: <FiSearch />,
    title: "Discover Businesses",
    desc: "Browse AI-scored, verified local businesses actively raising capital.",
    step: "01",
  },
  {
    icon: <FiDollarSign />,
    title: "Invest Any Amount",
    desc: "Buy fractional tokens starting from ₹100 — no minimums, no barriers.",
    step: "02",
  },
  {
    icon: <FiTrendingUp />,
    title: "Earn Monthly Returns",
    desc: "Smart contracts automatically distribute your share of profits on-chain.",
    step: "03",
  },
];

const FEATURES = [
  {
    icon: <FiZap />,
    title: "Lightning Fast",
    desc: "5-second finality on Stellar. Real-time transactions, zero waiting.",
    color: "from-yellow-500 to-orange-500",
    glow: "rgba(234,179,8,0.2)",
  },
  {
    icon: <FiShield />,
    title: "Ultra Low Fees",
    desc: "Near-zero gas. Distribute dividends to 1000 investors for less than $1.",
    color: "from-blue-500 to-cyan-500",
    glow: "rgba(0,198,255,0.2)",
  },
  {
    icon: <FiLock />,
    title: "Fully Transparent",
    desc: "Every investment and dividend permanently recorded on the Stellar blockchain.",
    color: "from-purple-500 to-primary-500",
    glow: "rgba(124,77,255,0.2)",
  },
  {
    icon: <FiCpu />,
    title: "AI-Powered Scoring",
    desc: "Each business is evaluated by an AI credit scoring model for risk transparency.",
    color: "from-teal-400 to-cyan-500",
    glow: "rgba(0,245,212,0.2)",
  },
  {
    icon: <FiPieChart />,
    title: "Auto-Dividends",
    desc: "Soroban smart contracts handle revenue splits automatically — no trust needed.",
    color: "from-pink-500 to-rose-500",
    glow: "rgba(236,72,153,0.2)",
  },
  {
    icon: <FiGlobe />,
    title: "Borderless Access",
    desc: "Connect your Freighter wallet and start investing in seconds from anywhere.",
    color: "from-green-500 to-teal-500",
    glow: "rgba(16,185,129,0.2)",
  },
];

const STATS = [
  { value: "500+", label: "Active Businesses" },
  { value: "12K+", label: "Investors" },
  { value: "₹2.4Cr", label: "Total Invested" },
  { value: "₹18L+", label: "Dividends Paid" },
];

/* ── Component ──────────────────────────────────────────────────────── */
const HomePage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, connectWallet } = useWallet();

  useEffect(() => {
    const load = async () => {
      try {
        const [bizRes] = await Promise.allSettled([
          getAllBusinesses({ status: "fundraising", limit: 3 }),
        ]);
        if (bizRes.status === "fulfilled")
          setBusinesses(bizRes.value.data.data?.businesses || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        <BackgroundOrbs variant="hero" />

        {/* Grid mesh overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="section-container relative z-10 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <AnimatedSection variant="fade-up" delay={0}>
              <div className="inline-flex items-center space-x-2 badge badge-neon mb-6">
                <FiZap size={12} />
                <span>Now live on Stellar Testnet</span>
              </div>
            </AnimatedSection>

            {/* Headline */}
            <AnimatedSection variant="fade-up" delay={0.1}>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] text-white mb-6">
                Invest in Your{" "}
                <span className="gradient-text">Community.</span>
                <br />
                Earn{" "}
                <span className="gradient-text-teal">Together.</span>
              </h1>
            </AnimatedSection>

            {/* Sub */}
            <AnimatedSection variant="fade-up" delay={0.2}>
              <p className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed">
                Connect your Freighter wallet, buy fractional tokens of verified local businesses,
                earn monthly dividends — all powered by Soroban smart contracts.
                <span className="text-gray-300"> No signup needed.</span>
              </p>
            </AnimatedSection>

            {/* CTA */}
            <AnimatedSection variant="fade-up" delay={0.3}>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isConnected ? (
                  <button onClick={connectWallet} className="btn-primary text-base py-3.5 px-8">
                    <FiLink className="mr-2" size={16} />
                    Connect Wallet to Invest
                  </button>
                ) : (
                  <Link to="/explore" className="btn-primary text-base py-3.5 px-8">
                    <FiSearch className="mr-2" size={16} />
                    Explore & Invest Now
                  </Link>
                )}
                <Link to="/raise-funds" className="btn-secondary text-base py-3.5 px-8">
                  Raise Funds for Your Business
                  <FiArrowRight className="ml-2" size={15} />
                </Link>
              </div>
            </AnimatedSection>

            {/* Social proof tickers */}
            <AnimatedSection variant="fade-up" delay={0.45}>
              <div className="flex flex-wrap items-center gap-5 mt-10">
                {[
                  "No KYC to Invest",
                  "Soroban Smart Contracts",
                  "Instant Dividends",
                ].map((t) => (
                  <div key={t} className="flex items-center space-x-1.5 text-sm text-gray-500">
                    <FiCheckCircle size={13} className="text-teal-400 flex-shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>


      </section>

      {/* ══ STATS BAR ═════════════════════════════════════════════════════ */}
      <section className="relative py-10 overflow-hidden" style={{ background: 'linear-gradient(90deg, rgba(124,77,255,0.08), rgba(0,198,255,0.06), rgba(0,245,212,0.04))' }}>
        <div className="divider-glow absolute top-0 inset-x-0" />
        <div className="divider-glow absolute bottom-0 inset-x-0" />
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s, i) => (
              <AnimatedSection key={s.label} variant="fade-up" delay={i * 0.08}>
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <BackgroundOrbs variant="subtle" />
        <div className="section-container relative z-10">
          <AnimatedSection variant="fade-up" className="text-center mb-16">
            <span className="badge badge-neon mb-4 inline-flex">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Start investing in <span className="gradient-text">3 simple steps</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              No complicated setup. Just connect your wallet and you're ready.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-14 left-[16.5%] right-[16.5%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(124,77,255,0.4), rgba(0,198,255,0.4), transparent)' }}
            />

            {HOW_IT_WORKS.map((s, i) => (
              <GlowCard key={i} className="p-5 text-center" glowColor="purple">
                <div className="text-3xl font-black gradient-text mb-3 opacity-30 leading-none">{s.step}</div>
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.2), rgba(0,198,255,0.15))", border: "1px solid rgba(124,77,255,0.25)" }}
                >
                  <span className="gradient-text">{s.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{s.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#111827' }}>
        <div className="section-container relative z-10">
          <AnimatedSection variant="fade-up" className="text-center mb-16">
            <span className="badge badge-cyan mb-4 inline-flex">Why InvestX</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for the <span className="gradient-text-teal">future of finance</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto">
              Every decision was made to give you the fastest, cheapest, and most transparent investment experience.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <GlowCard key={i} className="p-6" glowColor="purple">
                <div
                  className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${f.color.replace("from-", "").split(" ")[0]}, #7C4DFF)`,
                    boxShadow: `0 0 20px ${f.glow}`,
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED BUSINESSES ═══════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <BackgroundOrbs variant="subtle" />
        <div className="section-container relative z-10">
          <AnimatedSection variant="fade-up" className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
              <span className="badge badge-neon mb-3 inline-flex">Live Now</span>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Featured <span className="gradient-text">Businesses</span>
              </h2>
            </div>
            <Link to="/explore" className="btn-secondary text-sm py-2 px-5 flex-shrink-0">
              View All <FiArrowRight className="ml-1.5" size={13} />
            </Link>
          </AnimatedSection>

          {loading ? (
            <LoadingSpinner />
          ) : businesses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <BusinessCard key={b._id} business={b} />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <p className="text-gray-400">No businesses currently fundraising. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ══ SUCCESS STORIES ═══════════════════════════════════════════════ */}
      <SuccessStories />

      {/* ══ CTA BANNER ════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(124,77,255,0.12) 0%, rgba(0,198,255,0.08) 50%, rgba(0,245,212,0.05) 100%)" }}
        />
        <div className="divider-glow absolute top-0 inset-x-0" />
        <div className="divider-glow absolute bottom-0 inset-x-0" />

        <div className="section-container relative z-10 text-center">
          <AnimatedSection variant="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to start <span className="gradient-text">earning?</span>
            </h2>
            <p className="text-gray-400 max-w-md mx-auto mb-10">
              Join thousands of investors already earning passive income from local businesses on Stellar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected ? (
                <button onClick={connectWallet} className="btn-primary text-base py-3.5 px-10">
                  <FiZap className="mr-2" size={16} />
                  Get Started — Free
                </button>
              ) : (
                <Link to="/explore" className="btn-primary text-base py-3.5 px-10">
                  <FiSearch className="mr-2" size={16} />
                  Explore Businesses
                </Link>
              )}
              <Link to="/raise-funds" className="btn-secondary text-base py-3.5 px-10">
                List Your Business
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
