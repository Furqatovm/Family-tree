import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GitFork, Mail, Lock, Sparkles } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await authApi.login(data);
      login(res.access_token, res.user);
      if (res.user.is_admin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setValue('email', 'demo@example.com');
    setValue('password', 'password123');
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
          <h2 className="font-serif text-3xl font-bold text-[#1C1917]">Welcome back</h2>
          <p className="text-sm text-[#78716C]">Sign in to access your family tree archives</p>
        </div>

        {/* Demo Account Quick Button */}
        <div className="bg-[#EAF2EC] border border-[#3F6B4F]/20 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-[#3F6B4F]">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>Try the Demo Family Tree</span>
          </div>
          <Button type="button" size="sm" variant="primary" onClick={fillDemoAccount}>
            Fill Demo
          </Button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="eleanor@sterling.com"
            leftIcon={<Mail className="w-4 h-4" />}
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            {...register('password')}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-[#78716C] hover:text-[#3F6B4F] transition-colors">
              Parolni unutdingizmi?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full" size="lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-[#78716C]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#3F6B4F] font-bold hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
};
