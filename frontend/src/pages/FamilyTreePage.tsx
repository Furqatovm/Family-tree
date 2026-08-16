import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, GitFork, ArrowLeft, Filter, RefreshCw, Layers, FileText, Crown, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { treeApi } from '../api/treeApi';
import { personApi, PersonPayload } from '../api/personApi';
import { relationshipApi, RelationshipPayload } from '../api/relationshipApi';
import { familyApi } from '../api/familyApi';
import { TreeCanvas } from '../components/family-tree/TreeCanvas';
import { PersonDetailSidebar } from '../components/family-tree/PersonDetailSidebar';
import { AddEditPersonModal, PersonFormData } from '../components/people/AddEditPersonModal';
import { AddRelationshipModal, RelationshipFormData } from '../components/people/AddRelationshipModal';
import { DeleteConfirmModal } from '../components/people/DeleteConfirmModal';
import { FamilyPdfReportModal } from '../components/family/FamilyPdfReportModal';
import { ProUpgradeModal } from '../components/ui/ProUpgradeModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Person } from '../types';
import { getLayoutedElements } from '../lib/treeLayout';
import { useAuth } from '../context/AuthContext';

export const FamilyTreePage: React.FC = () => {
  const { familyId } = useParams<{ familyId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const numericFamilyId = Number(familyId);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [generationFilter, setGenerationFilter] = useState<number | 'all'>('all');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isMobileControlsOpen, setIsMobileControlsOpen] = useState(false);

  // Modal states
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [isAddRelationshipOpen, setIsAddRelationshipOpen] = useState(false);
  const [preselectedRelPerson, setPreselectedRelPerson] = useState<Person | null>(null);

  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Tree Data from REST API
  const { data: treeData, isLoading, refetch } = useQuery({
    queryKey: ['family-tree', numericFamilyId],
    queryFn: () => treeApi.getTreeData(numericFamilyId),
    enabled: Boolean(numericFamilyId),
  });

  // Mutations
  const createPersonMutation = useMutation({
    mutationFn: (payload: PersonPayload) => personApi.createPerson(numericFamilyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tree', numericFamilyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddPersonOpen(false);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.error || 'Failed to add person');
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PersonPayload> }) =>
      personApi.updatePerson(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tree', numericFamilyId] });
      setEditingPerson(null);
      setSelectedPerson(null);
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: (id: number) => personApi.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tree', numericFamilyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setDeletingPerson(null);
      setSelectedPerson(null);
    },
  });

  const createRelationshipMutation = useMutation({
    mutationFn: (payload: RelationshipPayload) =>
      relationshipApi.createRelationship(numericFamilyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-tree', numericFamilyId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddRelationshipOpen(false);
      setPreselectedRelPerson(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.error || 'Failed to create relationship');
    },
  });

  // Calculate tree layout using dagre layout algorithm
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (!treeData) return { layoutedNodes: [], layoutedEdges: [] };

    // Apply search filter if query is entered
    let filteredNodes = treeData.nodes;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredNodes = treeData.nodes.filter((node) => {
        const p = node.data;
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return fullName.includes(q);
      });
    }

    const { nodes: lNodes, edges: lEdges } = getLayoutedElements(
      filteredNodes as any,
      treeData.edges as any,
      generationFilter
    );

    return { layoutedNodes: lNodes, layoutedEdges: lEdges };
  }, [treeData, searchQuery, generationFilter]);

  // Keep active selectedPerson updated with fresh tree data when query invalidates
  React.useEffect(() => {
    if (selectedPerson && treeData) {
      const updated = treeData.people.find((p) => p.id === selectedPerson.id);
      if (updated) setSelectedPerson(updated);
    }
  }, [treeData]);

  const handlePersonSelectFromList = (personId: number) => {
    if (treeData) {
      const p = treeData.people.find((person) => person.id === personId);
      if (p) setSelectedPerson(p);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col md:flex-row overflow-hidden bg-[#FAFAF9] relative">
      {/* LEFT SIDEBAR CONTROLS */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-[#E7E5E4] flex flex-col p-3 sm:p-4 z-20 shadow-subtle flex-shrink-0 md:max-h-none md:overflow-y-auto">
        {/* Top Header Row (Always visible) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate('/dashboard')}
              className="text-xs px-2.5 py-1"
            >
              Dashboard
            </Button>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAFAF9]"
              title="Refresh Tree"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsMobileControlsOpen(!isMobileControlsOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1 bg-[#3F6B4F]/10 text-[#3F6B4F] hover:bg-[#3F6B4F]/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isMobileControlsOpen ? 'Yopish' : 'Sozlamalar'}</span>
            {isMobileControlsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Panel on Mobile, Always open on Desktop */}
        <div className={`space-y-4 pt-3 ${isMobileControlsOpen ? 'block' : 'hidden md:block'}`}>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917]">
              {treeData?.family?.name || 'Family Tree'}
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              {treeData?.people?.length || 0} ta oila a'zosi qayd etilgan
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2.5 !border-[#3F6B4F] !text-[#3F6B4F] font-serif font-bold text-xs"
              leftIcon={<FileText className="w-4 h-4 text-[#3F6B4F]" />}
              rightIcon={!(user?.is_admin || user?.plan_tier === 'pro') ? <Crown className="w-3.5 h-3.5 text-amber-600" /> : undefined}
              onClick={() => setIsPdfModalOpen(true)}
            >
              📄 PDF Kitob Eksport {!(user?.is_admin || user?.plan_tier === 'pro') && '(PRO)'}
            </Button>
          </div>

          {/* Search Input */}
          <Input
            placeholder="Shaxslarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          {/* Generation Depth Filters */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#3F6B4F]" /> Avlodlar chuqurligi
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setGenerationFilter('all')}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                  generationFilter === 'all'
                    ? 'bg-[#3F6B4F] text-white border-[#3F6B4F]'
                    : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#FAFAF9]'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setGenerationFilter(3)}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                  generationFilter === 3
                    ? 'bg-[#3F6B4F] text-white border-[#3F6B4F]'
                    : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#FAFAF9]'
                }`}
              >
                3 Avlod
              </button>
              <button
                onClick={() => setGenerationFilter(5)}
                className={`py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                  generationFilter === 5
                    ? 'bg-[#3F6B4F] text-white border-[#3F6B4F]'
                    : 'bg-white text-[#78716C] border-[#E7E5E4] hover:bg-[#FAFAF9]'
                }`}
              >
                5 Avlod
              </button>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="space-y-2 pt-2 border-t border-[#E7E5E4]">
            <Button
              variant="primary"
              className="w-full"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddPersonOpen(true)}
            >
              Shaxs Qo'shish
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              leftIcon={<GitFork className="w-4 h-4" />}
              onClick={() => setIsAddRelationshipOpen(true)}
              disabled={!treeData?.people || treeData.people.length < 2}
            >
              Qarindoshlik Bog'lash
            </Button>
          </div>

          {/* Error Notification Alert */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center justify-between">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage(null)} className="font-bold ml-2">
                ×
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* CENTER INTERACTIVE REACT FLOW CANVAS */}
      <main className="flex-1 h-full relative overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-[#FAFAF9]">
            <div className="text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#3F6B4F] animate-spin mx-auto" />
              <p className="text-sm font-medium text-[#78716C]">Loading family lineage...</p>
            </div>
          </div>
        ) : (
          <TreeCanvas
            nodes={layoutedNodes}
            edges={layoutedEdges}
            people={treeData?.people || []}
            relationships={treeData?.relationships || []}
            onSelectPerson={(p) => setSelectedPerson(p)}
            selectedPersonId={selectedPerson?.id ?? null}
          />
        )}
      </main>

      {/* RIGHT SIDEBAR DETAILS PANEL */}
      <PersonDetailSidebar
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onSelectPerson={handlePersonSelectFromList}
        onEdit={(person) => setEditingPerson(person)}
        onDelete={(person) => setDeletingPerson(person)}
        onAddRelationship={(person) => {
          setPreselectedRelPerson(person);
          setIsAddRelationshipOpen(true);
        }}
      />

      {/* MODALS */}
      {/* Add Person Modal */}
      <AddEditPersonModal
        isOpen={isAddPersonOpen}
        onClose={() => setIsAddPersonOpen(false)}
        onSubmit={async (data) => {
          await createPersonMutation.mutateAsync(data);
        }}
        isLoading={createPersonMutation.isPending}
      />

      {/* Edit Person Modal */}
      <AddEditPersonModal
        isOpen={Boolean(editingPerson)}
        onClose={() => setEditingPerson(null)}
        person={editingPerson}
        onSubmit={async (data) => {
          if (editingPerson) {
            await updatePersonMutation.mutateAsync({ id: editingPerson.id, payload: data });
          }
        }}
        isLoading={updatePersonMutation.isPending}
      />

      {/* Add Relationship Modal */}
      <AddRelationshipModal
        isOpen={isAddRelationshipOpen}
        onClose={() => {
          setIsAddRelationshipOpen(false);
          setPreselectedRelPerson(null);
        }}
        people={treeData?.people || []}
        preselectedPerson={preselectedRelPerson}
        onSubmit={async (data) => {
          await createRelationshipMutation.mutateAsync(data);
        }}
        isLoading={createRelationshipMutation.isPending}
      />

      {/* Delete Person Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingPerson)}
        onClose={() => setDeletingPerson(null)}
        title="Delete Family Member"
        message={`Are you sure you want to remove ${deletingPerson?.first_name} ${deletingPerson?.last_name}? All associated relationships will also be removed.`}
        onConfirm={async () => {
          if (deletingPerson) {
            await deletePersonMutation.mutateAsync(deletingPerson.id);
          }
        }}
        isLoading={deletePersonMutation.isPending}
      />

      {/* PDF Export Modal */}
      <FamilyPdfReportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        family={treeData?.family || null}
        people={treeData?.people || []}
        relationships={treeData?.relationships || []}
        onOpenProModal={() => setIsProModalOpen(true)}
      />

      {/* PRO Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
    </div>
  );
};
