import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Users, GitFork, Heart, Layers, ArrowRight, MapPin, Shield, FileText, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { familyApi, FamilyCreatePayload } from '../api/familyApi';
import { treeApi } from '../api/treeApi';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ProUpgradeModal } from '../components/ui/ProUpgradeModal';
import { FamilyPdfReportModal } from '../components/family/FamilyPdfReportModal';
import { Family, Person, Relationship } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [pdfFamily, setPdfFamily] = useState<Family | null>(null);
  const [pdfPeople, setPdfPeople] = useState<Person[]>([]);
  const [pdfRels, setPdfRels] = useState<Relationship[]>([]);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDescription, setNewFamilyDescription] = useState('');

  // Fetch families & real dashboard stats from backend REST API
  const { data: families = [], isLoading: isLoadingFamilies } = useQuery({
    queryKey: ['families'],
    queryFn: familyApi.getFamilies,
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: familyApi.getStats,
  });

  const createFamilyMutation = useMutation({
    mutationFn: (payload: FamilyCreatePayload) => familyApi.createFamily(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsCreateModalOpen(false);
      setNewFamilyName('');
      setNewFamilyDescription('');
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.error || '';
      if (errMsg.includes('PRO_LIMIT_EXCEEDED') || errMsg.includes('PRO tarif')) {
        setIsCreateModalOpen(false);
        setIsProModalOpen(true);
      }
    },
  });

  const handleOpenCreateModal = () => {
    if (!user?.is_admin && user?.plan_tier !== 'pro' && families.length >= 1) {
      setIsProModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleOpenPdfModal = async (fam: Family) => {
    setPdfFamily(fam);
    try {
      const data = await treeApi.getTreeData(fam.id);
      setPdfPeople(data.people || []);
      setPdfRels(data.relationships || []);
      setIsPdfModalOpen(true);
    } catch (err) {
      setPdfPeople([]);
      setPdfRels([]);
      setIsPdfModalOpen(true);
    }
  };

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    createFamilyMutation.mutate({
      name: newFamilyName.trim(),
      description: newFamilyDescription.trim(),
    });
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAF9] p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Super Admin Notice Banner */}
      {user?.is_admin && (
        <div className="bg-[#3F6B4F] text-white p-5 rounded-3xl shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Super Admin Account Active</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Barcha foydalanuvchilar va shajaralarni boshqarish uchun Admin Dashboardiga o'ting
              </p>
            </div>
          </div>
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm" className="!bg-white !text-[#3F6B4F] font-bold hover:!bg-emerald-50 whitespace-nowrap">
              Admin Dashboardga O'tish <ArrowRight className="w-4 h-4 ml-1 inline" />
            </Button>
          </Link>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E4]">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {getGreetingTime()}, {user?.first_name || 'Friend'} 👋
          </h1>
          <p className="text-[#78716C] mt-1 text-sm sm:text-base">
            Explore and expand your family heritage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/map">
            <Button variant="outline" leftIcon={<MapPin className="w-4 h-4 text-[#3F6B4F]" />}>
              Oila Xaritasi
            </Button>
          </Link>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            Create Family Tree
          </Button>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">Total Members</p>
            <p className="font-serif text-2xl font-bold text-[#1C1917]">
              {stats?.total_members ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#A67C52]/10 text-[#A67C52] flex items-center justify-center flex-shrink-0">
            <GitFork className="w-6 h-6 rotate-180" />
          </div>
          <div>
            <span className="text-xs text-[#78716C] font-semibold uppercase tracking-wider block">Tarif Statusi</span>
            <span className="font-serif text-sm font-bold text-[#3F6B4F]">
              {user?.is_admin
                ? 'Super Admin'
                : user?.plan_tier === 'pro'
                ? 'PRO Unlimited ($3.99)'
                : user?.plan_tier === 'basic'
                ? 'Basic ($1.99)'
                : 'Free Tier (1 Tree)'}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D6A756]/15 text-[#8A641C] flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">Relationships</p>
            <p className="font-serif text-2xl font-bold text-[#1C1917]">
              {stats?.total_relationships ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#78716C]">Generations</p>
            <p className="font-serif text-2xl font-bold text-[#1C1917]">Multi-tier</p>
          </div>
        </div>
      </div>

      {/* Families Section */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Your Family Trees</h2>

        {isLoadingFamilies ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-white rounded-3xl border border-[#E7E5E4] animate-pulse" />
            ))}
          </div>
        ) : families.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {families.map((fam: Family) => (
              <div
                key={fam.id}
                className="bg-white rounded-3xl border border-[#E7E5E4] p-6 shadow-subtle hover:shadow-card transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#3F6B4F] bg-[#3F6B4F]/10 px-2.5 py-1 rounded-full">
                      {fam.members_count ?? 0} Members
                    </span>
                    <span className="text-xs text-[#78716C]">Active</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917] mt-3">{fam.name}</h3>
                  {fam.description && (
                    <p className="text-sm text-[#78716C] mt-1 line-clamp-2">{fam.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Link to={`/families/${fam.id}/tree`}>
                      <Button variant="primary" className="w-full text-xs" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        Tree
                      </Button>
                    </Link>
                    <Link to={`/families/${fam.id}/map`}>
                      <Button variant="outline" className="w-full text-xs" leftIcon={<MapPin className="w-3.5 h-3.5 text-[#3F6B4F]" />}>
                        Map
                      </Button>
                    </Link>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs !border-[#3F6B4F] !text-[#3F6B4F] font-semibold"
                    leftIcon={<FileText className="w-3.5 h-3.5 text-[#3F6B4F]" />}
                    rightIcon={!(user?.is_admin || user?.plan_tier === 'pro') ? <Crown className="w-3.5 h-3.5 text-amber-600" /> : undefined}
                    onClick={() => handleOpenPdfModal(fam)}
                  >
                    📄 PDF Kitob Eksport {!(user?.is_admin || user?.plan_tier === 'pro') && '(PRO)'}
                  </Button>
                </div>
              </div>
            ))}

            {/* Create New Family Card Button */}
            <button
              onClick={handleOpenCreateModal}
              className="rounded-3xl border-2 border-dashed border-[#D6D3D1] hover:border-[#3F6B4F] p-8 flex flex-col items-center justify-center text-center gap-3 bg-white/50 hover:bg-white transition-all group min-h-[180px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#3F6B4F]/10 text-[#3F6B4F] group-hover:scale-110 flex items-center justify-center transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif font-bold text-base text-[#1C1917] block">
                  Create Family Tree
                </span>
                <span className="text-xs text-[#78716C]">Start building a new lineage branch</span>
              </div>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E7E5E4] p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">No family members yet</h3>
            <p className="text-sm text-[#78716C]">
              Start building your family story by creating your first family tree.
            </p>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreateModal}
            >
              Create Family Tree
            </Button>
          </div>
        )}
      </div>

      {/* Modal: Create New Family Tree */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Family Tree"
        subtitle="Start a new ancestral archive for a lineage or branch of your family"
      >
        <form onSubmit={handleCreateFamily} className="space-y-4">
          <Input
            label="Family Tree Name *"
            placeholder="The Sterling Family Heritage"
            value={newFamilyName}
            onChange={(e) => setNewFamilyName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/20"
              placeholder="A brief history or geographical origin of your lineage..."
              value={newFamilyDescription}
              onChange={(e) => setNewFamilyDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createFamilyMutation.isPending}
            >
              Create Family Tree
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: PRO Upgrade Subscription */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Modal: Family PDF Book Report */}
      <FamilyPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        family={pdfFamily}
        people={pdfPeople}
        relationships={pdfRels}
        onOpenProModal={() => setIsProModalOpen(true)}
      />
    </div>
  );
};
