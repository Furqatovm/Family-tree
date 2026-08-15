import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, GitFork, MapPin, Edit3, Key, Camera, Check, Calendar, Sparkles, Lock, ArrowRight, RefreshCw, X } from 'lucide-react';
import { Input as AntInput, Modal as AntModal, message as antMessage } from 'antd';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { familyApi } from '../api/familyApi';
import { Button } from '../components/ui/Button';

export const UserProfilePage: React.FC = () => {
  const { user, logout, refetchUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSaving, setIsSaving] = useState(false);

  // Change password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Avatar selector state
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Fetch user's families
  const { data: families = [], isLoading: isLoadingFamilies } = useQuery({
    queryKey: ['families'],
    queryFn: familyApi.getFamilies,
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      antMessage.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      });
      await refetchUser();
      setIsEditing(false);
      antMessage.success("Profil ma'lumotlaringiz muvaffaqiyatli yangilandi!");
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Profilni yangilashda xatolik yuz berdi";
      antMessage.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      antMessage.error("Iltimos, barcha parol maydonlarini to'ldiring");
      return;
    }

    if (newPassword !== confirmPassword) {
      antMessage.error("Yangi parollar bir-biriga mos kelmadi");
      return;
    }

    if (newPassword.length < 6) {
      antMessage.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setIsPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      antMessage.success('Parolingiz muvaffaqiyatli almashtirildi!');
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || "Eski parol noto'g'ri kiritildi";
      antMessage.error(errMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const currentAvatarUrl = customAvatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(
    (user?.first_name || 'U') + ' ' + (user?.last_name || 'S')
  )}&background=3F6B4F&color=fff&size=200`;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAF9] p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-10 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden"
      >
        {/* Background accent glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3F6B4F]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative group">
          <img
            src={currentAvatarUrl}
            alt={`${user?.first_name} ${user?.last_name}`}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#3F6B4F]/20 shadow-md"
          />
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            title="Change Avatar"
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-[#3F6B4F] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                {user?.first_name} {user?.last_name}
              </h1>
              <p className="text-sm text-[#78716C] flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-[#3F6B4F]" />
                <span>{user?.email}</span>
              </p>
            </div>

            <Button
              variant={isEditing ? 'outline' : 'primary'}
              size="sm"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => {
                if (!isEditing) {
                  setFirstName(user?.first_name || '');
                  setLastName(user?.last_name || '');
                  setEmail(user?.email || '');
                }
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Bekor qilish' : 'Profilni Tahrirlash'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-xs">
            <span className="bg-[#3F6B4F]/10 text-[#3F6B4F] px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Family Creator
            </span>
            <span className="bg-stone-100 text-[#78716C] px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" /> A'zo bo'lingan: 2026
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" /> Verified Account
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Info Form & Families List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Info / Edit Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-subtle space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4">
            <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
              <User className="w-5 h-5 text-[#3F6B4F]" /> Shaxsiy Ma'lumotlar
            </h2>
            <span className="text-xs text-[#78716C]">Account Details</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Ismingiz (First Name)</label>
                <AntInput
                  size="large"
                  value={firstName}
                  disabled={!isEditing}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Familiyangiz (Last Name)</label>
                <AntInput
                  size="large"
                  value={lastName}
                  disabled={!isEditing}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1">Email Manzilingiz</label>
              <AntInput
                size="large"
                type="email"
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                prefix={<Mail className="w-4 h-4 text-[#78716C] mr-1" />}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)}>
                  Bekor qilish
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isSaving} leftIcon={<Check className="w-4 h-4" />}>
                  Saqlash
                </Button>
              </div>
            )}
          </form>

          {/* Account Actions / Security */}
          <div className="pt-6 border-t border-[#E7E5E4] space-y-4">
            <h3 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
              <Key className="w-4 h-4 text-[#A67C52]" /> Hisob Xavfsizligi
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFAF9] border border-[#E7E5E4]">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Parolni Yangilash</p>
                <p className="text-[11px] text-[#78716C]">Hisobingiz xavfsizligini ta'minlash uchun parolni yangilang</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
                Parolni Almashtirish
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> JWT Seans Faol
              </span>
              <Button variant="danger" size="sm" onClick={logout}>
                Hisobdan Chiqish (Log Out)
              </Button>
            </div>
          </div>
        </motion.div>

        {/* User's Families Summary Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <h3 className="font-serif font-bold text-base text-[#1C1917] flex items-center gap-2">
                <GitFork className="w-4 h-4 text-[#3F6B4F] rotate-180" /> Mening Shajaralarim
              </h3>
              <span className="text-xs bg-[#3F6B4F]/10 text-[#3F6B4F] font-bold px-2 py-0.5 rounded-full">
                {families.length}
              </span>
            </div>

            <div className="space-y-3">
              {isLoadingFamilies ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-stone-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : families.length > 0 ? (
                families.map((fam) => (
                  <div
                    key={fam.id}
                    className="p-3.5 rounded-2xl border border-[#E7E5E4] hover:border-[#3F6B4F] bg-[#FAFAF9] hover:bg-white transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#1C1917] group-hover:text-[#3F6B4F] transition-colors">
                        {fam.name}
                      </h4>
                    </div>

                    <div className="flex gap-2 text-xs pt-1">
                      <Link to={`/families/${fam.id}/tree`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-[11px] py-1" leftIcon={<GitFork className="w-3 h-3 rotate-180 text-[#3F6B4F]" />}>
                          Tree View
                        </Button>
                      </Link>
                      <Link to={`/families/${fam.id}/map`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-[11px] py-1" leftIcon={<MapPin className="w-3 h-3 text-[#A67C52]" />}>
                          Live Map
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#78716C] space-y-2">
                  <p>Hali shajara yaratilmagan.</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>
                    Yangi Shajara Yaratish
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ant Design Modal: Change Password */}
      <AntModal
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        title="Parolni almashtirish"
        footer={null}
      >
        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#78716C] mb-1">Eski Parol *</label>
            <AntInput.Password
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78716C] mb-1">Yangi Parol *</label>
            <AntInput.Password
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78716C] mb-1">Yangi Parolni Tasdiqlang *</label>
            <AntInput.Password
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsPasswordModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isChangingPassword}>
              Parolni Saqlash
            </Button>
          </div>
        </form>
      </AntModal>

      {/* Ant Design Modal: Avatar Selector with PC File Upload */}
      <AntModal
        open={isAvatarModalOpen}
        onCancel={() => setIsAvatarModalOpen(false)}
        title="Profil suratingizni tanlang yoki yuklang"
        footer={null}
      >
        <div className="space-y-5 pt-2">
          {/* PC File Upload Zone */}
          <div className="border-2 border-dashed border-[#3F6B4F]/40 hover:border-[#3F6B4F] bg-[#3F6B4F]/5 rounded-2xl p-5 text-center space-y-2 cursor-pointer transition-all hover:bg-[#3F6B4F]/10 relative group">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 8 * 1024 * 1024) {
                  antMessage.error("Rasm hajmi 8MB dan oshmasligi kerak");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  const base64Url = reader.result as string;
                  setCustomAvatarUrl(base64Url);
                  setIsAvatarModalOpen(false);
                  antMessage.success("Kompyuterdan rasm muvaffaqiyatli yuklandi! 📸");
                };
                reader.readAsDataURL(file);
              }}
            />
            <div className="w-12 h-12 rounded-full bg-[#3F6B4F] text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1917]">💻 Kompyuterdan Rasm Yuklash (Choose File from PC)</p>
              <p className="text-[10px] text-[#78716C] mt-0.5">PNG, JPG, WEBP formats (Max: 8MB)</p>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E7E5E4]"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[#78716C] tracking-wider">Yoki tayyor suratlardan tanlang</span>
            <div className="flex-grow border-t border-[#E7E5E4]"></div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
            ].map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Avatar ${idx}`}
                onClick={() => {
                  setCustomAvatarUrl(url);
                  setIsAvatarModalOpen(false);
                  antMessage.success('Profil surati tanlandi!');
                }}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#E7E5E4] hover:border-[#3F6B4F] cursor-pointer hover:scale-105 transition-all"
              />
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#78716C] mb-1">Rasm havolasi (URL)</label>
            <AntInput
              placeholder="https://example.com/photo.jpg"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="primary" size="sm" onClick={() => setIsAvatarModalOpen(false)}>
              Tayyor
            </Button>
          </div>
        </div>
      </AntModal>
    </div>
  );
};

