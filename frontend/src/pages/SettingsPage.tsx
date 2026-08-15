import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Mail, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAF9] p-4 sm:p-8 max-w-4xl mx-auto space-y-8">
      <div className="pb-4 border-b border-[#E7E5E4]">
        <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Account & Settings</h1>
        <p className="text-sm text-[#78716C] mt-1">Manage your profile credentials and security preferences</p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-subtle space-y-6">
        <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
          <User className="w-5 h-5 text-[#3F6B4F]" /> User Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" value={user?.first_name || ''} readOnly disabled />
          <Input label="Last Name" value={user?.last_name || ''} readOnly disabled />
        </div>

        <Input
          label="Email Address"
          value={user?.email || ''}
          readOnly
          disabled
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <div className="pt-4 border-t border-[#E7E5E4] flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-[#78716C]">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>JWT Session Active</span>
          </div>
          <Button variant="danger" size="sm" onClick={logout}>
            Log Out Account
          </Button>
        </div>
      </div>
    </div>
  );
};
