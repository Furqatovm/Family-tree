import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Crown, ShieldCheck, Zap, Lock, CreditCard, X, Users, GitFork } from 'lucide-react';
import { Modal as AntModal, message as antMessage } from 'antd';
import { Button } from './Button';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUpgrade?: () => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccessUpgrade,
}) => {
  const { user, refetchUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  const isAlreadyMaxPro = user?.is_admin || user?.plan_tier === 'pro';

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const res = await authApi.subscribe(selectedPlan);
      await refetchUser();
      onClose();
      antMessage.success(res.message || 'Tarif muvaffaqiyatli xarid qilindi va faollashtirildi! 🌟👑');
      if (onSuccessUpgrade) onSuccessUpgrade();
    } catch (err: any) {
      antMessage.error(err?.response?.data?.error || 'To\'lovni amalga oshirishda xatolik yuz berdi');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAlreadyMaxPro) {
    return (
      <AntModal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={480}
        centered
        className="pro-upgrade-modal"
      >
        <div className="p-4 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-[#3F6B4F] text-amber-200 flex items-center justify-center mx-auto shadow-card">
            <Crown className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#3F6B4F] bg-[#3F6B4F]/10 px-3 py-1 rounded-full">
              Sizda Maksimal PRO Tarif Faol
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
              Maksimal PRO Tarifga Egasiz! 🌟
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-sm mx-auto pt-1">
              Siz allaqachon **PRO Unlimited** tarifidasiz. Sizda cheksiz shajaralar, cheksiz oila a'zolari va barcha premium imkoniyatlar faol.
            </p>
          </div>
          <Button variant="primary" onClick={onClose} className="w-full font-serif font-bold bg-[#3F6B4F] hover:bg-[#345A42]">
            Tushundim
          </Button>
        </div>
      </AntModal>
    );
  }

  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={620}
      centered
      className="pro-upgrade-modal"
    >
      <div className="p-1 sm:p-3 space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3F6B4F] text-amber-200 flex items-center justify-center mx-auto shadow-card">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Tarifingizni Yangilang
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto leading-relaxed">
            Ko'proq shajaralar va oila a'zolarini hujjatlashtirish uchun o'zingizga mos tarifni tanlang.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Basic Plan ($1.99) */}
          <div
            onClick={() => setSelectedPlan('basic')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative space-y-4 ${
              selectedPlan === 'basic'
                ? 'border-[#3F6B4F] bg-white shadow-card ring-2 ring-[#3F6B4F]/20'
                : 'border-[#E7E5E4] hover:border-[#3F6B4F]/40 bg-[#FAFAF9]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">Basic Plan</span>
              {selectedPlan === 'basic' && (
                <div className="w-5 h-5 rounded-full bg-[#3F6B4F] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-[#1C1917]">$1.99</span>
              <span className="text-xs text-[#78716C] ml-1">/ bir martalik</span>
            </div>
            <ul className="text-xs text-[#57534E] space-y-2 pt-1 border-t border-[#E7E5E4]">
              <li className="flex items-center gap-2 font-medium text-[#1C1917]">
                <GitFork className="w-4 h-4 text-[#3F6B4F] rotate-180 flex-shrink-0" /> Max 2 ta Family Tree
              </li>
              <li className="flex items-center gap-2 font-medium text-[#1C1917]">
                <Users className="w-4 h-4 text-[#3F6B4F] flex-shrink-0" /> Max 30 ta Oila A'zosi
              </li>
            </ul>
          </div>

          {/* PRO Plan ($3.99) - Best Value */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative space-y-4 ${
              selectedPlan === 'pro'
                ? 'border-[#3F6B4F] bg-[#3F6B4F]/5 shadow-card ring-2 ring-[#3F6B4F]/20'
                : 'border-[#E7E5E4] hover:border-[#3F6B4F]/40 bg-[#FAFAF9]'
            }`}
          >
            <span className="absolute -top-3 right-4 bg-[#3F6B4F] text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
              TAVSIYA ETILADI
            </span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#3F6B4F]">PRO Unlimited</span>
              {selectedPlan === 'pro' && (
                <div className="w-5 h-5 rounded-full bg-[#3F6B4F] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-[#1C1917]">$3.99</span>
              <span className="text-xs text-[#78716C] ml-1">/ bir martalik</span>
            </div>
            <ul className="text-xs text-[#57534E] space-y-2 pt-1 border-t border-[#E7E5E4]">
              <li className="flex items-center gap-2 font-bold text-[#3F6B4F]">
                <GitFork className="w-4 h-4 text-[#3F6B4F] rotate-180 flex-shrink-0" /> CHEKSIZ Family Trees
              </li>
              <li className="flex items-center gap-2 font-bold text-[#3F6B4F]">
                <Users className="w-4 h-4 text-[#3F6B4F] flex-shrink-0" /> CHEKSIZ Oila A'zolari
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Highlights List */}
        <div className="bg-[#FAFAF9] rounded-2xl p-4 border border-[#E7E5E4] space-y-2 text-xs text-[#57534E]">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>OpenStreetMap Jonli GPS Joylashuv Xaritasi & Avto-Manzil Search</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span>Telegram Bot Xabarnomalari va VIP Qo'llab-quvvatlash</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-1">
          <Button
            variant="primary"
            className="w-full py-3.5 text-base font-serif font-bold shadow-md bg-[#3F6B4F] hover:bg-[#345A42]"
            isLoading={isProcessing}
            onClick={handleCheckout}
            leftIcon={<CreditCard className="w-4 h-4" />}
          >
            {selectedPlan === 'pro' ? '$3.99 — PRO Unlimited Tarifga O\'tish' : '$1.99 — Basic Tarifga O\'tish'}
          </Button>
          <p className="text-[10px] text-center text-[#78716C] mt-2.5 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3F6B4F]" /> Xavfsiz bir martalik to'lov va abadiy foydalanish
          </p>
        </div>
      </div>
    </AntModal>
  );
};
