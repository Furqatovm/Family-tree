import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, GitFork, MapPin, Trash2, CheckCircle, ShieldAlert, Sparkles, RefreshCw, Layers, ExternalLink } from 'lucide-react';
import { Table, Tag, message as antMessage, Tabs } from 'antd';
import { adminApi, AdminUser, AdminFamily } from '../api/adminApi';
import { familyApi } from '../api/familyApi';
import { Button } from '../components/ui/Button';
import { DeleteConfirmModal } from '../components/people/DeleteConfirmModal';

export const AdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deletingFamily, setDeletingFamily] = useState<AdminFamily | null>(null);

  // Fetch admin stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  // Fetch admin users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  // Fetch admin families
  const { data: families = [], isLoading: isLoadingFamilies } = useQuery({
    queryKey: ['admin-families'],
    queryFn: adminApi.getFamilies,
  });

  // Toggle Admin Mutation
  const toggleAdminMutation = useMutation({
    mutationFn: (userId: number) => adminApi.toggleAdmin(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      antMessage.success(data.message);
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Xatolik yuz berdi');
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-families'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeletingUser(null);
      antMessage.success(data.message);
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Xatolik yuz berdi');
    },
  });

  // Delete Family Mutation (Admin)
  const deleteFamilyMutation = useMutation({
    mutationFn: (familyId: number) => familyApi.deleteFamily(familyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-families'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeletingFamily(null);
      antMessage.success("Shajara muvaffaqiyatli o'chirildi");
    },
    onError: (err: any) => {
      antMessage.error(err.response?.data?.error || 'Shajarani o\'chirishda xatolik yuz berdi');
    },
  });

  const userColumns = [
    {
      title: 'Foydalanuvchi',
      key: 'name',
      render: (record: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] font-bold flex items-center justify-center border border-[#3F6B4F]/30 text-xs">
            {record.first_name[0]}{record.last_name[0]}
          </div>
          <div>
            <p className="font-serif font-bold text-sm text-[#1C1917]">{record.first_name} {record.last_name}</p>
            <p className="text-xs text-[#78716C]">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Maqom (Role)',
      dataIndex: 'is_admin',
      key: 'is_admin',
      render: (isAdmin: boolean) =>
        isAdmin ? (
          <Tag color="success" icon={<Shield className="w-3 h-3 inline mr-1" />}>
            Super Admin
          </Tag>
        ) : (
          <Tag color="default">Standard User</Tag>
        ),
    },
    {
      title: 'Shajaralar Soni',
      dataIndex: 'families_count',
      key: 'families_count',
      render: (count: number) => <span className="font-bold text-[#3F6B4F]">{count} ta</span>,
    },
    {
      title: 'Qo\'shilgan Vaqti',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString() : '-'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: AdminUser) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs py-1"
            onClick={() => toggleAdminMutation.mutate(record.id)}
          >
            {record.is_admin ? 'Userga O\'tkazish' : 'Admin Qilish'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            title="Foydalanuvchini o'chirish"
            onClick={() => setDeletingUser(record)}
            className="text-rose-600 hover:bg-rose-50 p-1.5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const familyColumns = [
    {
      title: 'Shajara Nomi',
      key: 'name',
      render: (record: AdminFamily) => (
        <div>
          <p className="font-serif font-bold text-sm text-[#1C1917]">{record.name}</p>
          {record.description && <p className="text-xs text-[#78716C] truncate max-w-xs">{record.description}</p>}
        </div>
      ),
    },
    {
      title: 'Ega (Owner)',
      key: 'owner',
      render: (record: AdminFamily) => (
        <div>
          <p className="text-xs font-bold text-[#1C1917]">{record.owner_name}</p>
          <p className="text-[11px] text-[#78716C]">{record.owner_email}</p>
        </div>
      ),
    },
    {
      title: 'A\'zolar Soni',
      dataIndex: 'members_count',
      key: 'members_count',
      render: (count: number) => <Tag color="blue">{count} a'zo</Tag>,
    },
    {
      title: 'Yaratilgan Vaqt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString() : '-'),
    },
    {
      title: 'Amallar',
      key: 'actions',
      render: (record: AdminFamily) => (
        <div className="flex items-center gap-2">
          <Link to={`/families/${record.id}/tree`}>
            <Button variant="outline" size="sm" className="text-xs py-1" leftIcon={<GitFork className="w-3 h-3 rotate-180" />}>
              Tree
            </Button>
          </Link>
          <Link to={`/families/${record.id}/map`}>
            <Button variant="outline" size="sm" className="text-xs py-1" leftIcon={<MapPin className="w-3 h-3 text-[#A67C52]" />}>
              Map
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            title="Shajarani o'chirish"
            onClick={() => setDeletingFamily(record)}
            className="text-rose-600 hover:bg-rose-50 p-1.5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAF9] p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-card"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#3F6B4F] text-white flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">Super Admin Panel</h1>
          </div>
          <p className="text-sm text-[#78716C]">Platformadagi barcha foydalanuvchilar va shajaralarni boshqarish markazi</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-families'] });
            antMessage.success('Ma\'lumotlar yangilandi!');
          }}
          leftIcon={<RefreshCw className="w-4 h-4 text-[#3F6B4F]" />}
        >
          Ma'lumotlarni Yangilash
        </Button>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Jami Foydalanuvchilar</p>
          <p className="font-serif text-3xl font-bold text-[#1C1917]">{stats?.total_users ?? '-'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#A67C52]/10 text-[#A67C52] flex items-center justify-center">
            <GitFork className="w-5 h-5 rotate-180" />
          </div>
          <p className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Jami Shajaralar (Trees)</p>
          <p className="font-serif text-3xl font-bold text-[#3F6B4F]">{stats?.total_families ?? '-'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Jami Oila A'zolari</p>
          <p className="font-serif text-3xl font-bold text-amber-700">{stats?.total_people ?? '-'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs text-[#78716C] font-semibold uppercase tracking-wider">Munosabatlar (Lines)</p>
          <p className="font-serif text-3xl font-bold text-blue-600">{stats?.total_relationships ?? '-'}</p>
        </motion.div>
      </div>

      {/* Main Admin Tables */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E7E5E4] shadow-card"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'users',
              label: (
                <span className="font-serif font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#3F6B4F]" /> Foydalanuvchilarni Boshqarish ({users.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={users}
                  columns={userColumns}
                  rowKey="id"
                  loading={isLoadingUsers}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 650 }}
                  className="pt-2"
                />
              ),
            },
            {
              key: 'families',
              label: (
                <span className="font-serif font-bold text-sm flex items-center gap-2">
                  <GitFork className="w-4 h-4 text-[#A67C52] rotate-180" /> Barcha Shajaralar ({families.length})
                </span>
              ),
              children: (
                <Table
                  dataSource={families}
                  columns={familyColumns}
                  rowKey="id"
                  loading={isLoadingFamilies}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 650 }}
                  className="pt-2"
                />
              ),
            },
          ]}
        />
      </motion.div>

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={async () => {
          if (deletingUser) {
            await deleteUserMutation.mutateAsync(deletingUser.id);
          }
        }}
        title="Foydalanuvchini O'chirish"
        message={`"${deletingUser?.first_name} ${deletingUser?.last_name}" (${deletingUser?.email}) foydalanuvchisini va unga tegishli barcha oila shajaralarini butunlay o'chirmoqchimisiz?`}
        isLoading={deleteUserMutation.isPending}
      />

      {/* Delete Family Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingFamily)}
        onClose={() => setDeletingFamily(null)}
        onConfirm={async () => {
          if (deletingFamily) {
            await deleteFamilyMutation.mutateAsync(deletingFamily.id);
          }
        }}
        title="Shajarani O'chirish"
        message={`"${deletingFamily?.name}" oila shajarasi va unga tegishli barcha a'zolarni butunlay o'chirmoqchimisiz?`}
        isLoading={deleteFamilyMutation.isPending}
      />
    </div>
  );
};
