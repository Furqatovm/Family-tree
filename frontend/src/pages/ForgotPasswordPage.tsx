import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GitFork, Mail, KeyRound, Lock, ArrowLeft, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authApi } from '../api/authApi';
import { toast } from '../components/ui/CustomToast';
import { SEO } from '../components/common/SEO';

type Step = 'email' | 'verify' | 'success';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitMsg, setRateLimitMsg] = useState<string | null>(null);

  // STEP 1: Send OTP to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Yaroqli email manzil kiriting');
      return;
    }
    setErrorMessage(null);
    setRateLimitMsg(null);
    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setCode('');
      setStep('verify');
      toast.success(
        'Tiklash kodi yuborildi!',
        res.message || `${email} pochtangizga 6-xonali kod jo'natildi. Pochtangizni tekshiring.`
      );
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || 'Kod yuborishda xatolik yuz berdi';
      if (status === 429) {
        setRateLimitMsg(msg);
      } else {
        setErrorMessage(msg);
        toast.error('Xatolik', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify code and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) {
      setErrorMessage('6-xonali kodni to\'liq kiriting');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Parollar mos kelmaydi');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, code: code.trim(), new_password: newPassword });
      setStep('success');
      toast.success('Parol muvaffaqiyatli yangilandi!', 'Endi yangi parolingiz bilan kira olasiz.');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Parolni tiklashda xatolik yuz berdi';
      setErrorMessage(msg);
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      <SEO
        title="Parolni Tiklash — FamilyTree"
        description="FamilyTree hisobingiz parolini email orqali tiklang."
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl border border-[#E7E5E4] shadow-floating p-8 space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#3F6B4F] flex items-center justify-center text-white shadow-card">
              <GitFork className="w-6 h-6 rotate-180" />
            </div>
          </Link>
          <h2 className="font-serif text-3xl font-bold text-[#1C1917]">
            {step === 'email' && 'Parolni Tiklash'}
            {step === 'verify' && 'Yangi Parol O\'rnating'}
            {step === 'success' && 'Parol Yangilandi!'}
          </h2>
          <p className="text-sm text-[#78716C]">
            {step === 'email' && 'Emailingizga tiklash kodi yuboramiz'}
            {step === 'verify' && `Kod ${email} ga yuborildi — spam papkasini ham tekshiring`}
            {step === 'success' && 'Hisobingizga yangi parolingiz bilan kiring'}
          </p>
        </div>

        {/* Rate limit warning (special block) */}
        <AnimatePresence>
          {rateLimitMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Juda ko'p urinish</p>
                <p className="text-xs text-amber-700 mt-0.5">{rateLimitMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Regular error */}
        {errorMessage && !rateLimitMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Email Input */}
          {step === 'email' && (
            <motion.form
              key="email-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSendCode}
              className="space-y-4"
            >
              <Input
                label="Email Manzil *"
                type="email"
                placeholder="eleanor@sterling.com"
                leftIcon={<Mail className="w-4 h-4 text-[#3F6B4F]" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-[#3F6B4F] hover:bg-[#345A42] font-serif font-bold shadow-md"
                size="lg"
                isLoading={isLoading}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Tiklash Kodini Yuborish
              </Button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-xs text-[#78716C] hover:text-[#3F6B4F] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Loginga qaytish
              </Link>
            </motion.form>
          )}

          {/* STEP 2: OTP + New Password */}
          {step === 'verify' && (
            <motion.form
              key="verify-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              {/* Spam warning box */}
              <div className="bg-[#3F6B4F]/5 border border-[#3F6B4F]/20 p-4 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#3F6B4F] text-white flex items-center justify-center mx-auto">
                  <KeyRound className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[#1C1917]">Pochtangizga kod yuborildi!</p>
                <p className="text-xs text-[#57534E] leading-relaxed">
                  <span className="font-semibold text-[#3F6B4F]">{email}</span> manziliga
                  6 xonali tiklash kodi jo'natildi.
                </p>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 justify-center">
                  <span>⚠️</span>
                  <span>Iltimos <strong>spam / junk</strong> papkani ham tekshiring</span>
                </div>
              </div>

              <Input
                label="6-Xonali Tasdiqlash Kodi *"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                leftIcon={<KeyRound className="w-4 h-4 text-[#3F6B4F]" />}
                className="text-center font-mono text-xl tracking-widest font-bold"
              />

              <Input
                label="Yangi Parol *"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[#3F6B4F]" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                label="Yangi Parolni Tasdiqlang *"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[#3F6B4F]" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={confirmPassword && newPassword !== confirmPassword ? 'Parollar mos kelmaydi' : undefined}
              />

              <div className="space-y-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-[#3F6B4F] hover:bg-[#345A42] font-serif font-bold shadow-md"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Parolni Yangilash
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-xs text-[#78716C]"
                  leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  onClick={() => { setStep('email'); setCode(''); setErrorMessage(null); }}
                >
                  Orqaga (Emailni o'zgartirish)
                </Button>
              </div>
            </motion.form>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-5 py-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#3F6B4F] text-white flex items-center justify-center mx-auto shadow-card">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[#1C1917]">Parol muvaffaqiyatli yangilandi!</p>
                <p className="text-xs text-[#78716C]">Yangi parolingiz bilan tizimga kiring.</p>
              </div>
              <Button
                variant="primary"
                className="w-full bg-[#3F6B4F] font-serif font-bold"
                size="lg"
                onClick={() => navigate('/login')}
              >
                Kirish sahifasiga o'tish
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {step !== 'success' && (
          <p className="text-center text-xs text-[#78716C]">
            Parolni esladingizmi?{' '}
            <Link to="/login" className="text-[#3F6B4F] font-bold hover:underline">
              Kirish (Sign In)
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};
