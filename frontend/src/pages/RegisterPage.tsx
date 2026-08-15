import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GitFork, Mail, Lock, User, KeyRound, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui/CustomToast';

const registerSchema = z.object({
  first_name: z.string().min(1, 'Ism kiritilishi shart'),
  last_name: z.string().min(1, 'Familiya kiritilishi shart'),
  email: z.string().email('Noto\'g\'ri email manzil'),
  password: z.string().min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [formData, setFormData] = useState<RegisterFormData | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [devCode, setDevCode] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Step 1: Send 6-digit verification code to email
  const onSendCode = async (data: RegisterFormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await authApi.sendVerificationCode(data.email);
      setFormData(data);
      if (res.dev_code) {
        setDevCode(res.dev_code);
        setVerificationCode(res.dev_code);
      }
      setStep('verify');
      toast.success(
        'Kod emailingizga yuborildi!',
        `${data.email} pochtangizga 6-xonali kod jo'natildi.`
      );
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Tasdiqlash kodini yuborishda xatolik yuz berdi';
      setErrorMessage(msg);
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify 6-digit code and complete registration
  const onVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (verificationCode.trim().length !== 6) {
      setErrorMessage('6-xonali kodni to\'liq kiriting');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await authApi.verifyAndRegister({
        ...formData,
        code: verificationCode.trim(),
      });
      login(res.access_token, res.user);
      toast.success(
        'Muvaffaqiyatli ro\'yxatdan o\'tdingiz! 🎉',
        `Xush kelibsiz, ${res.user.first_name}!`
      );
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Kodni tasdiqlashda xatolik yuz berdi';
      setErrorMessage(msg);
      toast.error('Xatolik', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7E5E4] shadow-floating p-8 space-y-6">
        {/* Logo Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-2xl bg-[#3F6B4F] flex items-center justify-center text-white shadow-card">
              <GitFork className="w-6 h-6 rotate-180" />
            </div>
          </Link>
          <h2 className="font-serif text-3xl font-bold text-[#1C1917]">
            {step === 'details' ? 'Hisob Yaratish' : 'Emailni Tasdiqlash'}
          </h2>
          <p className="text-sm text-[#78716C]">
            {step === 'details'
              ? 'Oila shajarangizni avlodlar uchun saqlab qoling'
              : `Kod ${formData?.email} ga yuborildi — spam papkasini ham tekshiring`}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        {step === 'details' ? (
          /* STEP 1: Personal Details Form */
          <form onSubmit={handleSubmit(onSendCode)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Ism *"
                placeholder="Eleanor"
                leftIcon={<User className="w-4 h-4 text-[#3F6B4F]" />}
                {...register('first_name')}
                error={errors.first_name?.message}
              />
              <Input
                label="Familiya *"
                placeholder="Sterling"
                {...register('last_name')}
                error={errors.last_name?.message}
              />
            </div>

            <Input
              label="Email Manzil *"
              type="email"
              placeholder="eleanor@sterling.com"
              leftIcon={<Mail className="w-4 h-4 text-[#3F6B4F]" />}
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Parol *"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-[#3F6B4F]" />}
              {...register('password')}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full bg-[#3F6B4F] hover:bg-[#345A42] font-serif font-bold shadow-md"
              size="lg"
              isLoading={isLoading}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Tasdiqlash Kodini Olish (Email OTP)
            </Button>
          </form>
        ) : (
          /* STEP 2: 6-Digit OTP Code Verification */
          <form onSubmit={onVerifyAndRegister} className="space-y-5">
            <div className="bg-[#3F6B4F]/5 border border-[#3F6B4F]/20 p-4 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#3F6B4F] text-white flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-[#1C1917]">
                Pochtangizga kod yuborildi!
              </p>
              <p className="text-xs text-[#57534E] leading-relaxed">
                <span className="font-semibold text-[#3F6B4F]">{formData?.email}</span> manziliga
                6 xonali tasdiqlash kodi jo'natildi.
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 justify-center">
                <span>⚠️</span>
                <span>Pochtangizni yoki spam papkani tekshiring</span>
              </div>
              {devCode && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-emerald-700 block">Tasdiqlash kodi:</span>
                    <strong className="font-mono text-base tracking-widest text-emerald-900">{devCode}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(devCode)}
                    className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-emerald-800 transition"
                  >
                    Avto-to'ldirish
                  </button>
                </div>
              )}
            </div>

            <Input
              label="6-Xonali Tasdiqlash Kodi *"
              type="text"
              maxLength={6}
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              leftIcon={<KeyRound className="w-4 h-4 text-[#3F6B4F]" />}
              className="text-center font-mono text-xl tracking-widest font-bold"
              required
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
                Kodni Tasdiqlash & Ro'yxatdan O'tish
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-xs text-[#78716C]"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => {
                  setStep('details');
                  setVerificationCode('');
                  setErrorMessage(null);
                }}
              >
                Orqaga (Emailni o'zgartirish)
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-[#78716C]">
          Allaqachon hisobingiz bormi?{' '}
          <Link to="/login" className="text-[#3F6B4F] font-bold hover:underline">
            Kirish (Sign In)
          </Link>
        </p>
      </div>
    </div>
  );
};
