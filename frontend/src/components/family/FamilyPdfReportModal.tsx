import React from 'react';
import { Modal as AntModal } from 'antd';
import { Printer, Crown, Lock, FileText, User, MapPin, Briefcase, Calendar, Heart, GitFork, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Person, Family, Relationship } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface FamilyPdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
  people: Person[];
  relationships: Relationship[];
  onOpenProModal: () => void;
}

export const FamilyPdfReportModal: React.FC<FamilyPdfReportModalProps> = ({
  isOpen,
  onClose,
  family,
  people,
  relationships,
  onOpenProModal,
}) => {
  const { user } = useAuth();
  const isPro = user?.is_admin || user?.plan_tier === 'pro';

  const handlePrint = () => {
    window.print();
  };

  // Helper to format relationships for a person
  const getRelationshipsForPerson = (personId: number) => {
    const parentRels = relationships.filter((r) => r.person_2_id === personId && r.relationship_type === 'parent');
    const parents = parentRels.map((r) => people.find((p) => p.id === r.person_1_id)).filter(Boolean);

    const childRels = relationships.filter((r) => r.person_1_id === personId && r.relationship_type === 'parent');
    const children = childRels.map((r) => people.find((p) => p.id === r.person_2_id)).filter(Boolean);

    const spouseRels = relationships.filter(
      (r) => (r.person_1_id === personId || r.person_2_id === personId) && r.relationship_type === 'spouse'
    );
    const spouses = spouseRels
      .map((r) => people.find((p) => p.id === (r.person_1_id === personId ? r.person_2_id : r.person_1_id)))
      .filter(Boolean);

    return { parents, children, spouses };
  };

  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={840}
      centered
      className="pdf-report-modal"
    >
      {!isPro ? (
        /* PRO Lock Overlay */
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-[#3F6B4F]/10 text-[#3F6B4F] flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              <Crown className="w-3.5 h-3.5" /> PRO Exclusiv Imkoniyat
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">
              PDF Eksport Faqat PRO Foydalanuvchilar Uchun
            </h3>
            <p className="text-sm text-[#78716C] max-w-md mx-auto">
              Butun oilangiz shajarasini foto-rasmlari, tarjimai hollari va batafsil ma'lumotlari bilan chop etiladigan PDF kitob shaklida yuklab olish uchun PRO tarifga o'ting.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="font-serif font-bold shadow-md w-full sm:w-auto"
              leftIcon={<Crown className="w-4 h-4 text-amber-200" />}
              onClick={() => {
                onClose();
                onOpenProModal();
              }}
            >
              PRO Tarifga O'tish
            </Button>
            <a
              href="https://t.me/furqatov_m"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-block"
            >
              <Button
                variant="outline"
                size="lg"
                className="font-serif font-semibold !border-[#3F6B4F] !text-[#3F6B4F] hover:!bg-[#3F6B4F]/5 w-full"
                leftIcon={<Send className="w-4 h-4 text-[#3F6B4F]" />}
              >
                Telegram: @furqatov_m
              </Button>
            </a>
          </div>
        </div>
      ) : (
        /* PRO Authorized PDF Printable View */
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Control Bar (Hidden during actual print) */}
          <div className="print:hidden flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3F6B4F]">
              <Crown className="w-4 h-4 text-amber-600" />
              <span>PRO PDF Kitob Eksport Tayyor</span>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              className="bg-[#3F6B4F] hover:bg-[#345A42] font-serif font-bold shadow-md"
            >
              🖨️ PDF sifatida Saqlash (Print)
            </Button>
          </div>

          {/* PRINTABLE DOCUMENT AREA */}
          <div id="printable-pdf-content" className="space-y-8 bg-white p-4 sm:p-8 rounded-2xl border border-[#E7E5E4] text-[#1C1917]">
            {/* Header / Document Cover */}
            <div className="border-b-2 border-[#3F6B4F] pb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#3F6B4F] text-white flex items-center justify-center font-bold">
                    <GitFork className="w-5 h-5 rotate-180" />
                  </div>
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-[#1C1917]">FamilyTree</h1>
                    <p className="text-[10px] text-[#78716C] uppercase tracking-widest font-semibold">Ancestry & Heritage Archive</p>
                  </div>
                </div>
                <div className="text-right text-xs text-[#78716C]">
                  <p>Hujjat sanasi: {new Date().toLocaleDateString()}</p>
                  <p className="font-semibold text-[#3F6B4F]">Rasmiy Shajara Kitobi</p>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="font-serif text-3xl font-bold text-[#3F6B4F]">
                  {family?.name || 'Oila Shajarasi'}
                </h2>
                {family?.description && (
                  <p className="text-sm text-[#57534E] italic mt-1">{family.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-[#78716C] pt-2">
                  <span>Jami A'zolar: <strong>{people.length} kishi</strong></span>
                  <span>•</span>
                  <span>Egasi: <strong>{user?.first_name} {user?.last_name}</strong></span>
                </div>
              </div>
            </div>

            {/* MEMBER LISTING SECTION */}
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1C1917] border-b border-[#E7E5E4] pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-[#3F6B4F]" />
                Oila A'zolari va Avlodlar Manbalari ({people.length})
              </h3>

              <div className="divide-y divide-[#E7E5E4] space-y-6 pt-2">
                {people.map((person, idx) => {
                  const rels = getRelationshipsForPerson(person.id);

                  return (
                    <div key={person.id} className="pt-6 first:pt-0 space-y-4 page-break-inside-avoid">
                      <div className="flex items-start gap-4 sm:gap-6">
                        {/* Member Photo */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-[#3F6B4F] bg-[#FAFAF9] overflow-hidden flex-shrink-0 shadow-sm">
                          {person.photo_url ? (
                            <img
                              src={person.photo_url}
                              alt={person.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#3F6B4F] font-serif font-bold text-2xl bg-[#3F6B4F]/10">
                              {person.first_name[0]}{person.last_name[0]}
                            </div>
                          )}
                        </div>

                        {/* Member Core Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-serif text-lg font-bold text-[#1C1917]">
                              #{idx + 1}. {person.first_name} {person.middle_name || ''} {person.last_name}
                            </h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              person.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                            }`}>
                              {person.gender === 'male' ? 'Erkak' : 'Ayol'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#57534E] pt-1">
                            {(person.date_of_birth || person.date_of_death) && (
                              <p className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#3F6B4F]" />
                                <span>Tug'ilgan: {person.date_of_birth || '?'} {person.date_of_death ? `— Vafot: ${person.date_of_death}` : ''}</span>
                              </p>
                            )}

                            {person.birthplace && (
                              <p className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#3F6B4F]" />
                                <span>Tug'ilgan joyi: {person.birthplace}</span>
                              </p>
                            )}

                            {person.occupation && (
                              <p className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-[#3F6B4F]" />
                                <span>Kasbi: {person.occupation}</span>
                              </p>
                            )}

                            {person.current_location_name && (
                              <p className="flex items-center gap-1.5 col-span-1 sm:col-span-2 text-[#3F6B4F] font-semibold">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Jonli Xaritadagi Manzili: {person.current_location_name}</span>
                              </p>
                            )}
                          </div>

                          {/* Family Links / Relationships */}
                          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-[#57534E]">
                            {rels.parents.length > 0 && (
                              <span className="bg-[#FAFAF9] border border-[#E7E5E4] px-2 py-0.5 rounded-lg">
                                👨‍👩‍👧 Ota-onasi: <strong>{rels.parents.map((p) => `${p?.first_name} ${p?.last_name}`).join(', ')}</strong>
                              </span>
                            )}
                            {rels.spouses.length > 0 && (
                              <span className="bg-[#FAFAF9] border border-[#E7E5E4] px-2 py-0.5 rounded-lg">
                                💍 Turmush o'rtog'i: <strong>{rels.spouses.map((p) => `${p?.first_name} ${p?.last_name}`).join(', ')}</strong>
                              </span>
                            )}
                            {rels.children.length > 0 && (
                              <span className="bg-[#FAFAF9] border border-[#E7E5E4] px-2 py-0.5 rounded-lg">
                                👶 Farzandlari ({rels.children.length}): <strong>{rels.children.map((p) => p?.first_name).join(', ')}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Biography section */}
                      {person.biography && (
                        <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4] text-xs text-[#57534E] leading-relaxed">
                          <p className="font-semibold text-[#1C1917] mb-1">Tarjimai Hol / Biografiya:</p>
                          <p className="whitespace-pre-line">{person.biography}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Printable Document Footer */}
            <div className="border-t border-[#E7E5E4] pt-4 text-center text-xs text-[#78716C]">
              <p>© {new Date().getFullYear()} FamilyTree Inc. Barcha huquqlar himoyalangan.</p>
            </div>
          </div>
        </div>
      )}
    </AntModal>
  );
};
