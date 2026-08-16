import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Crown, ShieldCheck, Zap, Lock, CreditCard, X, Users, GitFork, Send, Copy, MessageCircle } from 'lucide-react';
import { Modal as AntModal, message as antMessage } from 'antd';
import { Button } from './Button';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUpgrade?: () => void;
  defaultPlan?: 'basic' | 'pro';
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  onSuccessUpgrade,
  defaultPlan = 'pro',
}) => {
  const { user, refetchUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>(defaultPlan);
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (defaultPlan) {
      setSelectedPlan(defaultPlan);
    }
  }, [defaultPlan, isOpen]);

  const isAlreadyMaxPro = user?.is_admin || user?.plan_tier === 'pro';

  const handleCopyUsername = () => {
    navigator.clipboard.writeText('@furqatov_m');
    antMessage.success('@furqatov_m nusxalandi! Telegram orqali yozishingiz mumkin.');
  };

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      antMessage.success('Email manzilingiz nusxalandi!');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      antMessage.info('Iltimos, avval Telegram orqali @furqatov_m ga yozing yoki ro\'yxatdan o\'ting');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await authApi.subscribe(selectedPlan);
      await refetchUser();
      onClose();
      antMessage.success(res.message || 'Tarif muvaffaqiyatli faollashtirildi! 🌟👑');
      if (onSuccessUpgrade) onSuccessUpgrade();
    } catch (err: any) {
      antMessage.error(err?.response?.data?.error || 'Xatolik yuz berdi');
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
      width={600}
      centered
      className="pro-upgrade-modal"
    >
      <div className="p-1 sm:p-3 space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center mx-auto shadow-subtle border border-[#3F6B4F]/20">
            <Send className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Tarifni Telegram Orqali Xarid Qilish
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] max-w-md mx-auto leading-relaxed">
            PRO yoki Basic tarifini faollashtirish va to'lov qilish uchun Telegram orqali <strong className="text-[#3F6B4F] font-bold">@furqatov_m</strong> ga yozishingiz kerak bo'ladi.
          </p>
        </div>

        {/* Selected Plan Toggle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Basic Plan ($1.99) */}
          <div
            onClick={() => setSelectedPlan('basic')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative space-y-3 ${
              selectedPlan === 'basic'
                ? 'border-[#3F6B4F] bg-[#3F6B4F]/5 shadow-card ring-2 ring-[#3F6B4F]/20'
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
              <span className="font-serif text-2xl font-bold text-[#1C1917]">$1.99</span>
              <span className="text-xs text-[#78716C] ml-1">/ bir martalik</span>
            </div>
            <ul className="text-xs text-[#57534E] space-y-1.5 pt-1 border-t border-[#E7E5E4]">
              <li className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                <GitFork className="w-3.5 h-3.5 text-[#3F6B4F] rotate-180 flex-shrink-0" /> Max 2 ta Shajara
              </li>
              <li className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                <Users className="w-3.5 h-3.5 text-[#3F6B4F] flex-shrink-0" /> Max 30 ta Oila A'zosi
              </li>
            </ul>
          </div>

          {/* PRO Plan ($3.99) - Best Value */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative space-y-3 ${
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
              <span className="font-serif text-2xl font-bold text-[#1C1917]">$3.99</span>
              <span className="text-xs text-[#78716C] ml-1">/ bir martalik</span>
            </div>
            <ul className="text-xs text-[#57534E] space-y-1.5 pt-1 border-t border-[#E7E5E4]">
              <li className="flex items-center gap-1.5 font-bold text-[#3F6B4F]">
                <GitFork className="w-3.5 h-3.5 text-[#3F6B4F] rotate-180 flex-shrink-0" /> CHEKSIZ Shajaralar
              </li>
              <li className="flex items-center gap-1.5 font-bold text-[#3F6B4F]">
                <Users className="w-3.5 h-3.5 text-[#3F6B4F] flex-shrink-0" /> CHEKSIZ Oila A'zolari
              </li>
            </ul>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4] space-y-3 text-xs text-[#1C1917]">
          <div className="flex items-center gap-2 font-bold text-[#1C1917] text-sm">
            <Sparkles className="w-4 h-4 text-[#3F6B4F]" />
            <span>Qanday qilib faollashtiriladi?</span>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-[#57534E]">
            <p className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
              <span>Telegram'da <strong className="text-[#1C1917]">@furqatov_m</strong> profiliga yozing.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
              <span>Tanlagan tarifingiz ({selectedPlan === 'pro' ? 'PRO Unlimited $3.99' : 'Basic Plan $1.99'}) va emailingizni bildiring.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
              <span>To'lov tasdiqlangach, hisobingiz darhol PRO holatiga o'tkaziladi.</span>
            </p>
          </div>

          {user?.email && (
            <div className="pt-2 border-t border-[#E7E5E4] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#78716C]">Sizning emailingiz: <strong className="text-[#1C1917]">{user.email}</strong></span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-[11px] font-bold text-[#3F6B4F] hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" /> Nusxalash
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <a
            href="https://t.me/furqatov_m"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block"
          >
            <Button
              variant="primary"
              className="w-full py-3.5 text-sm sm:text-base font-bold shadow-md bg-[#3F6B4F] hover:bg-[#345A42] !text-white flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Telegram orqali adminga yozish (@furqatov_m)
            </Button>
          </a>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyUsername}
              className="text-xs font-semibold text-[#3F6B4F] hover:underline flex items-center gap-1.5 py-1.5 px-3 rounded-xl hover:bg-[#3F6B4F]/10 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Username nusxalash: @furqatov_m
            </button>
          </div>

          <p className="text-[10px] text-center text-[#78716C] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3F6B4F]" /> Xavfsiz to'lov va admin tomonidan tezkor faollashtirish
          </p>
        </div>
      </div>
    </AntModal>
  );
};
