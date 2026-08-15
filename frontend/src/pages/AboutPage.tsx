import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GitFork, Heart, ShieldCheck, Users, Sparkles, Compass, Award, Globe, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SEO } from '../components/common/SEO';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] overflow-hidden flex flex-col">
      <SEO
        title="Biz Haqimizda — FamilyTree Merosi va Missiyasi"
        description="FamilyTree platformasi tarixi, missiyasi va avlodlar xotirasini saqlash bo'yicha imkoniyatlari haqida bilib oling."
      />
      {/* Hero Header */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3F6B4F]/10 border border-[#3F6B4F]/20 text-[#3F6B4F] text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Mission & Legacy</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-6xl font-bold text-[#1C1917] tracking-tight leading-[1.15] max-w-3xl mx-auto"
        >
          Preserving family history <span className="text-[#3F6B4F] italic">for generations to come.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-[#78716C] max-w-2xl mx-auto leading-relaxed"
        >
          FamilyTree was born out of a passion to bridge generations. We build beautiful digital archiving tools that turn scattered family memories into a living, breathing organic tree.
        </motion.p>
      </section>

      {/* Impact Statistics */}
      <section className="py-12 bg-white border-y border-[#E7E5E4] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="space-y-1"
          >
            <p className="font-serif text-3xl sm:text-5xl font-bold text-[#3F6B4F]">50,000+</p>
            <p className="text-xs sm:text-sm text-[#78716C] font-medium">Family Trees Created</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-1"
          >
            <p className="font-serif text-3xl sm:text-5xl font-bold text-[#A67C52]">1.2M+</p>
            <p className="text-xs sm:text-sm text-[#78716C] font-medium">Ancestors Archived</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1"
          >
            <p className="font-serif text-3xl sm:text-5xl font-bold text-amber-600">45+</p>
            <p className="text-xs sm:text-sm text-[#78716C] font-medium">Countries Connected</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-1"
          >
            <p className="font-serif text-3xl sm:text-5xl font-bold text-[#3F6B4F]">99.9%</p>
            <p className="text-xs sm:text-sm text-[#78716C] font-medium">Data Security Uptime</p>
          </motion.div>
        </div>
      </section>

      {/* Core Pillars / Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            What drives our platform
          </h2>
          <p className="text-[#78716C]">
            Every feature we build is designed with love, respect, and technological rigor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-3xl border border-[#E7E5E4] space-y-4 shadow-subtle hover:shadow-card transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center">
              <GitFork className="w-6 h-6 rotate-180" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Organic Metaphor</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              We reject cold, sterile organizational charts. Family trees are living organisms with roots, curved branches, and blooming fruit nodes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white p-8 rounded-3xl border border-[#E7E5E4] space-y-4 shadow-subtle hover:shadow-card transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#A67C52]/10 text-[#A67C52] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Uncompromised Privacy</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Your family records, portraits, and location histories are strictly private and encrypted. Only authorized family members can access your tree.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-8 rounded-3xl border border-[#E7E5E4] space-y-4 shadow-subtle hover:shadow-card transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Global Live Map</h3>
            <p className="text-sm text-[#78716C] leading-relaxed">
              Connect family members scattered across continents with interactive Leaflet maps, movement trail breadcrumbs, and live GPS updates.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="bg-[#3F6B4F] text-[#1C1917] rounded-3xl p-10 sm:p-14 space-y-6 shadow-floating"
        >
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">Join thousands of archiving families</h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-base sm:text-lg">
            Start documenting your roots and watching your lineage bloom today.
          </p>
          <div className="pt-2 flex justify-center">
            <Link to="/register">
              <Button size="lg" className="!bg-white !text-[#3F6B4F] hover:!bg-emerald-50 border-none font-serif font-bold shadow-lg" rightIcon={<ArrowRight className="w-4 h-4 text-[#3F6B4F]" />}>
                Build Your Tree Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};
