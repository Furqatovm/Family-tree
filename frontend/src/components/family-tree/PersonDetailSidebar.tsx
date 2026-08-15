import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Trash2, Plus, Calendar, MapPin, Briefcase, UserCheck, ExternalLink, Heart, Users } from 'lucide-react';
import { Person } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

interface PersonDetailSidebarProps {
  person: Person | null;
  onClose: () => void;
  onSelectPerson: (personId: number) => void;
  onEdit: (person: Person) => void;
  onDelete: (person: Person) => void;
  onAddRelationship: (person: Person) => void;
}

export const PersonDetailSidebar: React.FC<PersonDetailSidebarProps> = ({
  person,
  onClose,
  onSelectPerson,
  onEdit,
  onDelete,
  onAddRelationship,
}) => {
  if (!person) return null;

  const isDeceased = Boolean(person.date_of_death);

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full md:w-96 bg-white border-l border-[#E7E5E4] h-full flex flex-col shadow-floating z-30 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E7E5E4] flex items-center justify-between bg-[#FAFAF9]">
          <h3 className="font-serif font-semibold text-lg text-[#1C1917]">Person Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#E7E5E4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Profile Card */}
          <div className="text-center">
            <div className="relative inline-block mb-3">
              {person.photo_url ? (
                <img
                  src={person.photo_url}
                  alt={person.first_name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#3F6B4F] shadow-card mx-auto"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#EAF2EC] border-2 border-[#3F6B4F] flex items-center justify-center text-[#3F6B4F] font-serif font-bold text-3xl mx-auto shadow-card">
                  {person.first_name[0]}
                  {person.last_name[0]}
                </div>
              )}
              {isDeceased && (
                <span className="absolute bottom-0 right-0 bg-stone-800 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  Deceased
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
              {person.first_name} {person.middle_name ? `${person.middle_name} ` : ''}{person.last_name}
            </h2>

            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant={person.gender}>{person.gender}</Badge>
              {person.generation && <Badge variant="secondary">Generation {person.generation}</Badge>}
            </div>

            <div className="mt-3">
              <Link to={`/people/${person.id}`}>
                <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  View Full Profile Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="bg-[#FAFAF9] rounded-2xl p-4 border border-[#E7E5E4] space-y-3">
            {person.date_of_birth && (
              <div className="flex items-center gap-3 text-sm text-[#1C1917]">
                <Calendar className="w-4 h-4 text-[#3F6B4F] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#78716C] block">Birth Date</span>
                  <span>{person.date_of_birth}</span>
                </div>
              </div>
            )}

            {person.date_of_death && (
              <div className="flex items-center gap-3 text-sm text-[#1C1917]">
                <Calendar className="w-4 h-4 text-stone-500 flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#78716C] block">Passed Away</span>
                  <span>{person.date_of_death}</span>
                </div>
              </div>
            )}

            {person.birthplace && (
              <div className="flex items-center gap-3 text-sm text-[#1C1917]">
                <MapPin className="w-4 h-4 text-[#A67C52] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#78716C] block">Birthplace</span>
                  <span>{person.birthplace}</span>
                </div>
              </div>
            )}

            {person.occupation && (
              <div className="flex items-center gap-3 text-sm text-[#1C1917]">
                <Briefcase className="w-4 h-4 text-[#D6A756] flex-shrink-0" />
                <div>
                  <span className="text-xs text-[#78716C] block">Occupation</span>
                  <span>{person.occupation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Biography */}
          {person.biography && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-1.5">Biography</h4>
              <p className="text-sm text-[#1C1917] leading-relaxed bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4]">
                {person.biography}
              </p>
            </div>
          )}

          {/* Family Connections Section */}
          <div className="space-y-4 pt-2 border-t border-[#E7E5E4]">
            <h4 className="font-serif font-semibold text-base text-[#1C1917]">Family Network</h4>

            {/* Parents */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">
                <UserCheck className="w-3.5 h-3.5 text-[#3F6B4F]" /> Parents ({person.parents?.length || 0})
              </div>
              {person.parents && person.parents.length > 0 ? (
                <div className="space-y-1.5">
                  {person.parents.map((parent) => (
                    <button
                      key={parent.id}
                      onClick={() => onSelectPerson(parent.id)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#FAFAF9] hover:bg-[#EAF2EC] border border-[#E7E5E4] flex items-center justify-between text-sm transition-colors group"
                    >
                      <span className="font-medium text-[#1C1917] group-hover:text-[#3F6B4F]">
                        {parent.first_name} {parent.last_name}
                      </span>
                      <span className="text-xs text-[#78716C]">{parent.gender}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#78716C] italic">No parents recorded.</p>
              )}
            </div>

            {/* Spouse */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">
                <Heart className="w-3.5 h-3.5 text-[#D6A756]" /> Spouse ({person.spouses?.length || 0})
              </div>
              {person.spouses && person.spouses.length > 0 ? (
                <div className="space-y-1.5">
                  {person.spouses.map((spouse) => (
                    <button
                      key={spouse.id}
                      onClick={() => onSelectPerson(spouse.id)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#FAFAF9] hover:bg-[#FAF5EA] border border-[#E7E5E4] flex items-center justify-between text-sm transition-colors group"
                    >
                      <span className="font-medium text-[#1C1917] group-hover:text-[#C29443]">
                        {spouse.first_name} {spouse.last_name}
                      </span>
                      <span className="text-xs text-[#78716C]">{spouse.gender}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#78716C] italic">No spouse recorded.</p>
              )}
            </div>

            {/* Children */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider mb-2">
                <Users className="w-3.5 h-3.5 text-[#A67C52]" /> Children ({person.children?.length || 0})
              </div>
              {person.children && person.children.length > 0 ? (
                <div className="space-y-1.5">
                  {person.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => onSelectPerson(child.id)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#FAFAF9] hover:bg-[#F7F3EE] border border-[#E7E5E4] flex items-center justify-between text-sm transition-colors group"
                    >
                      <span className="font-medium text-[#1C1917] group-hover:text-[#A67C52]">
                        {child.first_name} {child.last_name}
                      </span>
                      <span className="text-xs text-[#78716C]">{child.gender}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#78716C] italic">No children recorded.</p>
              )}
            </div>

            {/* Siblings (Automatically derived!) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#78716C] uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-sky-600" /> Siblings ({person.siblings?.length || 0})
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Auto-derived</span>
              </div>
              {person.siblings && person.siblings.length > 0 ? (
                <div className="space-y-1.5">
                  {person.siblings.map((sibling) => (
                    <button
                      key={sibling.id}
                      onClick={() => onSelectPerson(sibling.id)}
                      className="w-full text-left p-2.5 rounded-xl bg-[#FAFAF9] hover:bg-sky-50 border border-[#E7E5E4] flex items-center justify-between text-sm transition-colors group"
                    >
                      <span className="font-medium text-[#1C1917] group-hover:text-sky-700">
                        {sibling.first_name} {sibling.last_name}
                      </span>
                      <span className="text-xs text-[#78716C]">{sibling.gender}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#78716C] italic">No derived siblings.</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 border-t border-[#E7E5E4] bg-[#FAFAF9] space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => onAddRelationship(person)}
          >
            Add Relationship
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              leftIcon={<Edit className="w-4 h-4" />}
              onClick={() => onEdit(person)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => onDelete(person)}
            >
              Delete
            </Button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};
