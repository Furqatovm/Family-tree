import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, Heart, Sparkles, ArrowRight, ShieldCheck, Users, Search, Compass, MapPin, Play, RefreshCw, Plus, Minus, HelpCircle, Check, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/common/SEO';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [demoGrowthKey, setDemoGrowthKey] = React.useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);

  const isProActive = user?.is_admin || user?.plan_tier === 'pro';

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] overflow-hidden flex flex-col">
      <SEO
        title="FamilyTree — Oila Shajarasi, Nasabnoma va Avlodlar Merosi"
        description="O'zbekistonda birinchi interaktiv oila shajarasi platformasi. Oilangiz avlodlari tarixini, fotosuratlari va GPS xaritasini abadiylashtiring."
        keywords="oila shajarasi, nasabnoma, shajara yaratish, family tree uzbekistan, genealogy, avlodlar tarixi"
      />
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Generational Family Archiving</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-6xl font-bold text-[#1C1917] tracking-tight leading-[1.15]"
            >
              Your family story, <span className="text-[#3F6B4F] italic">connected.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-[#78716C] font-normal leading-relaxed max-w-2xl mx-auto"
            >
              Preserve, explore, and visualize your family heritage across generations. Map ancestor connections, store biographical memories, and watch automatic sibling lineages unfold in an interactive canvas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link to="/register">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Build Your Tree Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Explore Demo Account
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Hero Visual Mockup Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative rounded-3xl bg-white border border-[#E7E5E4] shadow-floating p-4 sm:p-8 max-w-5xl mx-auto overflow-hidden"
          >
            {/* Subtle Grid Canvas Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#E7E5E4_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

            {/* Interactive Tree Diagram Mockup */}
            <div className="relative z-10 space-y-8">
              {/* Gen 1: Grandparents */}
              <div className="flex justify-center items-center gap-6 sm:gap-12">
                <div className="bg-white border-2 border-[#3F6B4F] p-3 rounded-2xl shadow-card flex items-center gap-3 w-56">
                  <div className="w-10 h-10 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/30 flex items-center justify-center text-[#3F6B4F] font-serif font-bold">
                    A
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#1C1917]">Arthur Sterling</h4>
                    <p className="text-[10px] text-[#78716C]">1938 – 2018</p>
                  </div>
                </div>

                <span className="text-[#D6A756] font-semibold text-xs border-b-2 border-dashed border-[#D6A756] px-2 py-0.5">
                  Spouse
                </span>

                <div className="bg-white border-2 border-rose-400 p-3 rounded-2xl shadow-card flex items-center gap-3 w-56">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-serif font-bold">
                    M
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#1C1917]">Margaret Vance</h4>
                    <p className="text-[10px] text-[#78716C]">1942 – Present</p>
                  </div>
                </div>
              </div>

              {/* Connecting Vertical Line */}
              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-[#3F6B4F]" />
              </div>

              {/* Gen 2: Parents */}
              <div className="flex justify-center items-center gap-6 sm:gap-12">
                <div className="bg-white border-2 border-[#3F6B4F] p-3 rounded-2xl shadow-card flex items-center gap-3 w-56">
                  <div className="w-10 h-10 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/30 flex items-center justify-center text-[#3F6B4F] font-serif font-bold">
                    R
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#1C1917]">Robert Sterling</h4>
                    <p className="text-[10px] text-[#78716C]">1968 – Present</p>
                  </div>
                </div>

                <div className="bg-white border-2 border-rose-400 p-3 rounded-2xl shadow-card flex items-center gap-3 w-56">
                  <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-serif font-bold">
                    C
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[#1C1917]">Catherine Chen</h4>
                    <p className="text-[10px] text-[#78716C]">1971 – Present</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Tree Growth Interactive Showcase Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Organic Growth Metaphor</span>
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
              Watch your family tree grow like a living tree
            </h2>

            <p className="text-base sm:text-lg text-[#78716C] leading-relaxed max-w-2xl mx-auto">
              Root ancestors anchor the soil base, while organic wooden branches curve upward and descendant members bloom as hanging fruits on the branches.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={() => setDemoGrowthKey((k) => k + 1)}
                className="shadow-md"
              >
                Replay Growth Animation
              </Button>
            </div>
          </motion.div>

          {/* Animated Tree Growth Interactive Canvas Box */}
          <motion.div
            key={demoGrowthKey}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-white border border-[#E7E5E4] shadow-floating p-4 sm:p-10 max-w-4xl mx-auto min-h-[440px] flex items-center justify-center overflow-hidden"
          >
            {/* Background subtle grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#E7E5E4_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

            <div className="relative w-full max-w-[800px] h-[380px]">
              {/* SVG Curved Bezier Wood Branches with viewBox scaling */}
              <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
                <defs>
                  <linearGradient id="landingBranchGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#4A2E1B" />
                    <stop offset="60%" stopColor="#6B4226" />
                    <stop offset="100%" stopColor="#3F6B4F" />
                  </linearGradient>
                </defs>

                {/* Trunk Pillar at Base */}
                <motion.path
                  d="M 400 360 Q 395 330, 400 300"
                  stroke="url(#landingBranchGradient)"
                  strokeWidth={14}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.6 }}
                />

                {/* Branch 1 to Left Gen 2 (Robert Sterling) */}
                <motion.path
                  d="M 400 300 C 320 270, 260 240, 240 210"
                  stroke="url(#landingBranchGradient)"
                  strokeWidth={10}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />

                {/* Branch 2 to Right Gen 2 (Julian Sterling) */}
                <motion.path
                  d="M 400 300 C 480 270, 540 240, 560 210"
                  stroke="url(#landingBranchGradient)"
                  strokeWidth={10}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />

                {/* Sub-branch to Gen 3 (Eleanor Sterling) */}
                <motion.path
                  d="M 240 210 C 200 170, 160 130, 150 90"
                  stroke="url(#landingBranchGradient)"
                  strokeWidth={7}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                />

                {/* Sub-branch to Gen 3 (Lucas Sterling) */}
                <motion.path
                  d="M 240 210 C 280 170, 320 130, 330 90"
                  stroke="url(#landingBranchGradient)"
                  strokeWidth={7}
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                />
              </svg>

              {/* HTML Animated Person Nodes positioned by percentage */}
              {/* ROOT PERSON (Arthur Sterling) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.1, type: 'spring' }}
                style={{ left: '50%', top: '90%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full p-1 bg-gradient-to-br from-[#A67C52] via-[#5C3D2E] to-[#3F6B4F] shadow-lg group-hover:scale-110 transition-transform relative">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
                    alt="Arthur Sterling"
                    className="w-full h-full rounded-full object-cover border border-amber-200"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-[#A67C52] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow">
                    🌳 ROOT
                  </span>
                </div>
                <span className="mt-1 bg-[#1C1917] text-white px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-serif font-bold shadow">
                  Arthur Sterling
                </span>
              </motion.div>

              {/* GEN 2 LEFT (Robert Sterling) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.7, type: 'spring' }}
                style={{ left: '30%', top: '52.5%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-0.5 h-4 bg-[#5C3D2E] relative">
                  <span className="absolute -top-1.5 -right-2 text-[10px]">🍃</span>
                </div>
                <motion.div
                  whileHover={{ rotate: [-4, 4, -4, 0] }}
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-full p-1 bg-gradient-to-br from-rose-500 to-amber-500 shadow-md group-hover:scale-110 transition-transform relative"
                >
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                    alt="Robert Sterling"
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </motion.div>
                <span className="mt-1 bg-white text-[#1C1917] border border-[#E7E5E4] px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-serif font-bold shadow">
                  Robert Sterling
                </span>
              </motion.div>

              {/* GEN 2 RIGHT (Julian Sterling) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.8, type: 'spring' }}
                style={{ left: '70%', top: '52.5%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-0.5 h-4 bg-[#5C3D2E] relative">
                  <span className="absolute -top-1.5 -right-2 text-[10px]">🍃</span>
                </div>
                <motion.div
                  whileHover={{ rotate: [-4, 4, -4, 0] }}
                  className="w-12 sm:w-14 h-12 sm:h-14 rounded-full p-1 bg-gradient-to-br from-amber-400 to-emerald-500 shadow-md group-hover:scale-110 transition-transform relative"
                >
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                    alt="Julian Sterling"
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </motion.div>
                <span className="mt-1 bg-white text-[#1C1917] border border-[#E7E5E4] px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-serif font-bold shadow">
                  Julian Sterling
                </span>
              </motion.div>

              {/* GEN 3 LEFT (Eleanor Sterling) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 1.2, type: 'spring' }}
                style={{ left: '18.75%', top: '22.5%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-0.5 h-4 bg-[#5C3D2E] relative">
                  <span className="absolute -top-1.5 -right-2 text-[10px]">🍃</span>
                </div>
                <motion.div
                  whileHover={{ rotate: [-4, 4, -4, 0] }}
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-full p-1 bg-gradient-to-br from-rose-500 to-amber-500 shadow-md group-hover:scale-110 transition-transform relative"
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
                    alt="Eleanor Sterling"
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </motion.div>
                <span className="mt-1 bg-white text-[#1C1917] border border-[#E7E5E4] px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-serif font-bold shadow">
                  Eleanor Sterling
                </span>
              </motion.div>

              {/* GEN 3 RIGHT (Lucas Sterling) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 1.3, type: 'spring' }}
                style={{ left: '41.25%', top: '22.5%' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group cursor-pointer"
              >
                <div className="w-0.5 h-4 bg-[#5C3D2E] relative">
                  <span className="absolute -top-1.5 -right-2 text-[10px]">🍃</span>
                </div>
                <motion.div
                  whileHover={{ rotate: [-4, 4, -4, 0] }}
                  className="w-10 sm:w-12 h-10 sm:h-12 rounded-full p-1 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md group-hover:scale-110 transition-transform relative"
                >
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt="Lucas Sterling"
                    className="w-full h-full rounded-full object-cover border border-white"
                  />
                </motion.div>
                <span className="mt-1 bg-white text-[#1C1917] border border-[#E7E5E4] px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-serif font-bold shadow">
                  Lucas Sterling
                </span>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-20 bg-white border-y border-[#E7E5E4] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16 space-y-3"
            >
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
                Crafted for family archives
              </h2>
              <p className="text-[#78716C]">
                Everything you need to preserve your family legacy with clarity and precision.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <GitFork className="w-6 h-6 rotate-180" />,
                  bg: 'bg-[#3F6B4F]/10 text-[#3F6B4F]',
                  title: 'Interactive Canvas',
                  desc: 'Zoom, pan, and navigate multi-generational family trees seamlessly powered by custom organic curved SVG branch rendering.',
                },
                {
                  icon: <MapPin className="w-6 h-6" />,
                  bg: 'bg-[#A67C52]/10 text-[#A67C52]',
                  title: 'Oila Xaritasi (Live Map)',
                  desc: 'Track real-time member locations, drag markers with auto-geocoding, and view historical movement trails directly on interactive maps.',
                },
                {
                  icon: <ShieldCheck className="w-6 h-6" />,
                  bg: 'bg-[#D6A756]/15 text-[#8A641C]',
                  title: 'Persistent & Private',
                  desc: 'All records, biographies, birth dates, and portraits are stored securely in a relational database protected with JWT authentication.',
                },
              ].map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.15, type: 'spring', stiffness: 120 }}
                  className="bg-[#FAFAF9] p-8 rounded-3xl border border-[#E7E5E4] space-y-4 hover:shadow-card hover:-translate-y-1 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center`}>
                    {feat.icon}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917]">{feat.title}</h3>
                  <p className="text-sm text-[#78716C] leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] text-xs font-semibold uppercase tracking-wider">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>Transparent Pricing</span>
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
              O'zingizga mos tarifni tanlang
            </h2>

            <p className="text-base sm:text-lg text-[#78716C]">
              Oylik obunasiz, bir marta to'lang va oilangiz tarixini avlodlar uchun saqlab qoling.
            </p>
          </motion.div>

          {isProActive ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#3F6B4F] to-[#2D4D38] text-white p-8 sm:p-12 rounded-3xl shadow-card text-center space-y-6 max-w-2xl mx-auto border-2 border-amber-300/40 relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-3xl bg-white/15 text-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <Crown className="w-9 h-9" />
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-200 bg-white/10 px-3.5 py-1 rounded-full border border-white/15 inline-block">
                  Sizda Maksimal Tarif Faol
                </span>
                <h3 className="font-serif text-3xl font-bold">
                  Siz PRO Unlimited Tarifidasiz! 🌟
                </h3>
                <p className="text-sm text-emerald-100 leading-relaxed max-w-md mx-auto">
                  Sizda barcha cheksiz imkoniyatlar, PDF kitob eksporti va jonli xaritalar faollashtirilgan. Qo'shimcha to'lov talab etilmaydi.
                </p>
              </div>
              <Link to="/dashboard" className="inline-block">
                <Button variant="outline" size="lg" className="!bg-white !text-[#3F6B4F] font-serif font-bold shadow-lg border-none hover:!bg-emerald-50">
                  Dashboardga O'tish <ArrowRight className="w-4 h-4 ml-1.5 inline" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-8 rounded-3xl border border-[#E7E5E4] shadow-subtle flex flex-col justify-between space-y-6 hover:shadow-card transition-all"
              >
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block">Free Plan</span>
                  <div>
                    <span className="font-serif text-4xl font-bold text-[#1C1917]">$0</span>
                    <span className="text-xs text-[#78716C] ml-1">/ bepul</span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Boshlang'ich oilaviy shajarani sinab ko'rish uchun mo'ljallangan bepul imkoniyat.
                  </p>
                  <ul className="text-xs text-[#57534E] space-y-2.5 pt-2 border-t border-[#E7E5E4]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> Max 1 ta Family Tree
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> Max 10 ta Oila A'zosi
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> Daraxtni vizual ko'rish
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="w-full">
                  <Button variant="outline" className="w-full justify-center">
                    Bepul Boshlash
                  </Button>
                </Link>
              </motion.div>

              {/* Basic Plan ($1.99) */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-8 rounded-3xl border-2 border-[#E7E5E4] shadow-subtle flex flex-col justify-between space-y-6 hover:border-[#3F6B4F]/50 hover:shadow-card transition-all relative"
              >
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block">Basic Plan</span>
                  <div>
                    <span className="font-serif text-4xl font-bold text-[#1C1917]">$1.99</span>
                    <span className="text-xs text-[#78716C] ml-1">/ bir martalik</span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Kichik va o'rta oilalar uchun mo'ljallangan optimal paket.
                  </p>
                  <ul className="text-xs text-[#57534E] space-y-2.5 pt-2 border-t border-[#E7E5E4]">
                    <li className="flex items-center gap-2 font-medium text-[#1C1917]">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> Max 2 ta Family Tree
                    </li>
                    <li className="flex items-center gap-2 font-medium text-[#1C1917]">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> Max 30 ta Oila A'zosi
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> OpenStreetMap Live Map
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="w-full">
                  <Button variant="outline" className="w-full justify-center !border-[#3F6B4F] !text-[#3F6B4F]">
                    Basic Xarid Qilish
                  </Button>
                </Link>
              </motion.div>

              {/* PRO Plan ($3.99) - Featured */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-8 rounded-3xl border-2 border-[#3F6B4F] shadow-card flex flex-col justify-between space-y-6 relative scale-[1.02] bg-gradient-to-b from-[#3F6B4F]/5 to-white"
              >
                <span className="absolute -top-3.5 right-6 bg-[#3F6B4F] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                  TAVSIYA ETILADI
                </span>
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3F6B4F] block">PRO Unlimited</span>
                  <div>
                    <span className="font-serif text-4xl font-bold text-[#1C1917]">$3.99</span>
                    <span className="text-xs text-[#78716C] ml-1">/ bir martalik</span>
                  </div>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Katta shajaralar va cheksiz avlodlarni hujjatlashtiruvchilar uchun ideal.
                  </p>
                  <ul className="text-xs text-[#57534E] space-y-2.5 pt-2 border-t border-[#E7E5E4]">
                    <li className="flex items-center gap-2 font-bold text-[#3F6B4F]">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> CHEKSIZ Family Trees
                    </li>
                    <li className="flex items-center gap-2 font-bold text-[#3F6B4F]">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> CHEKSIZ Oila A'zolari
                    </li>
                    <li className="flex items-center gap-2 font-medium text-[#1C1917]">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> OpenStreetMap Live GPS Map
                    </li>
                    <li className="flex items-center gap-2 font-medium text-[#1C1917]">
                      <Check className="w-4 h-4 text-[#3F6B4F]" /> Telegram Bot Xabarnomalari
                    </li>
                  </ul>
                </div>
                <Link to="/register" className="w-full">
                  <Button variant="primary" className="w-full justify-center bg-[#3F6B4F] hover:bg-[#345A42] font-bold shadow-md">
                    PRO Unlimited Boshlash
                  </Button>
                </Link>
              </motion.div>
            </div>
          )}
        </section>

        {/* Frequently Asked Questions (FAQ) Section */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917] tracking-tight">
              Frequently asked questions
            </h2>

            <p className="text-base sm:text-lg text-[#78716C]">
              Everything you need to know about our organic family tree, data privacy, and live map tools.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: 'How does the organic tree visualization work?',
                a: 'Unlike traditional rigid organizational charts, FamilyTree renders a living growing tree. Root ancestors anchor the base soil, while curved SVG wood branches curve outward and descendants bloom as fruit nodes with profile pictures and names.',
              },
              {
                q: 'Is my family data and location history private?',
                a: 'Yes, 100%. All family tree data, biography records, portraits, and live GPS locations on Oila Xaritasi are encrypted in our relational database and accessible strictly by invited, authenticated family members.',
              },
              {
                q: 'How does the Oila Xaritasi (Family Live Map) work?',
                a: 'Oila Xaritasi allows family members to view each other’s active locations on an interactive Leaflet map. You can drag member cards to update position with auto-saving reverse geocoding, turn on live movement simulation, or view dashed breadcrumb movement trails.',
              },
              {
                q: 'Can I add siblings, spouses, and multi-generational relatives?',
                a: 'Yes! Our backend automatically calculates parent, spouse, full-sibling, and half-sibling lineages. When you add relationships, the organic Bezier tree layout re-computes branch angles dynamically to prevent overlapping.',
              },
              {
                q: 'Can I switch between the Growing Tree View and Compact Diagram View?',
                a: 'Absolutely. You can toggle anytime between the "🌳 Growing Tree View" (visual tree metaphor with wood branches) and "📊 Compact Diagram View" using the view switcher on the tree page.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="bg-white rounded-3xl border border-[#E7E5E4] shadow-subtle overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif font-bold text-base sm:text-lg text-[#1C1917] hover:text-[#3F6B4F] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                        isOpen
                          ? 'bg-[#3F6B4F] text-white border-[#3F6B4F] rotate-180 shadow-sm'
                          : 'bg-[#FAFAF9] text-[#78716C] border-[#E7E5E4] hover:bg-[#3F6B4F]/10 hover:text-[#3F6B4F]'
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="faq-body"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 text-sm text-[#78716C] leading-relaxed border-t border-[#F5F5F4]">
                          <p>{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="bg-[#3F6B4F] text-white rounded-3xl p-10 sm:p-16 space-y-6 shadow-floating relative overflow-hidden"
          >
            <h2 className="font-serif text-3xl sm:text-5xl font-bold">Start your family tree today</h2>
            <p className="text-emerald-100 max-w-xl mx-auto text-base sm:text-lg">
              Create your account in seconds and preserve your family history for generations to come.
            </p>
            <div className="pt-4 flex justify-center">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="!bg-white !text-[#3F6B4F] hover:!bg-emerald-50 !border-none font-serif font-bold shadow-lg hover:scale-105 transition-all"
                  rightIcon={<ArrowRight className="w-4 h-4 text-[#3F6B4F]" />}
                >
                  Get Started Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Footer Section */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="bg-white border-t border-[#E7E5E4] pt-16 pb-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#3F6B4F] flex items-center justify-center text-white shadow-card">
                  <GitFork className="w-5 h-5 rotate-180" />
                </div>
                <div>
                  <span className="font-serif text-xl font-bold text-[#1C1917] tracking-tight">FamilyTree</span>
                  <span className="block text-[10px] uppercase font-semibold text-[#78716C] tracking-widest -mt-1">Ancestry & Heritage</span>
                </div>
              </Link>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Empowering multi-generational families to document, connect, and visualize their ancestry with cutting-edge digital archiving tools.
              </p>
            </div>

            {/* Product links */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C1917]">Product</h4>
              <ul className="space-y-2 text-xs text-[#78716C]">
                <li>
                  <Link to="/map" className="hover:text-[#3F6B4F] transition-colors">Oila Xaritasi (Live Map)</Link>
                </li>
                <li>
                  <Link to="/dashboard" className="hover:text-[#3F6B4F] transition-colors">Growing Tree View</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#3F6B4F] transition-colors">Create Family Tree</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#3F6B4F] transition-colors">Demo Account</Link>
                </li>
              </ul>
            </div>

            {/* Resources links */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C1917]">Resources</h4>
              <ul className="space-y-2 text-xs text-[#78716C]">
                <li>
                  <a href="#features" className="hover:text-[#3F6B4F] transition-colors">Genealogy Guide</a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-[#3F6B4F] transition-colors">User Stories</a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3F6B4F] transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#3F6B4F] transition-colors">Terms of Service</a>
                </li>
              </ul>
            </div>

            {/* Contact column */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#1C1917]">Contact & Support</h4>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Have questions or feedback? Our team is dedicated to helping you archive your family lineage.
              </p>
              <div className="pt-1">
                <a
                  href="mailto:support@familytree.app"
                  className="text-xs font-semibold text-[#3F6B4F] hover:underline"
                >
                  support@familytree.app
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
            <p>© 2026 FamilyTree Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
