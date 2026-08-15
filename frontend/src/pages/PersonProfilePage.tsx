import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Briefcase, Heart, UserCheck, Users, Clock } from 'lucide-react';
import { personApi } from '../api/personApi';
import { treeApi } from '../api/treeApi';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const PersonProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', numericId],
    queryFn: () => personApi.getPerson(numericId),
    enabled: Boolean(numericId),
  });

  const { data: treeData } = useQuery({
    queryKey: ['family-tree', person?.family_id],
    queryFn: () => treeApi.getTreeData(person!.family_id),
    enabled: Boolean(person?.family_id),
  });

  const fullPerson = treeData?.people.find((p) => p.id === numericId) || person;

  if (isLoading || !fullPerson) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-[#FAFAF9]">
        <div className="w-8 h-8 rounded-full border-2 border-[#3F6B4F] border-t-transparent animate-spin" />
      </div>
    );
  }

  const birthYear = fullPerson.date_of_birth ? fullPerson.date_of_birth.split('-')[0] : '';
  const deathYear = fullPerson.date_of_death ? fullPerson.date_of_death.split('-')[0] : '';
  const lifeSpan = birthYear ? `${birthYear} – ${deathYear || 'Present'}` : 'Life Span';

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#FAFAF9] p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Back to Tree
        </Button>
      </div>

      {/* Hero Profile Banner */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        <div className="relative">
          {fullPerson.photo_url ? (
            <img
              src={fullPerson.photo_url}
              alt={fullPerson.first_name}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-[#3F6B4F] shadow-floating"
            />
          ) : (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#EAF2EC] border-4 border-[#3F6B4F] flex items-center justify-center text-[#3F6B4F] font-serif font-bold text-4xl shadow-floating">
              {fullPerson.first_name[0]}
              {fullPerson.last_name[0]}
            </div>
          )}
        </div>

        <div className="text-center md:text-left space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <Badge variant={fullPerson.gender}>{fullPerson.gender}</Badge>
            {fullPerson.generation && <Badge variant="secondary">Generation {fullPerson.generation}</Badge>}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {fullPerson.first_name} {fullPerson.middle_name ? `${fullPerson.middle_name} ` : ''}{fullPerson.last_name}
          </h1>

          <p className="text-base text-[#A67C52] font-semibold">{lifeSpan}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-sm text-[#78716C]">
            {fullPerson.date_of_birth && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#3F6B4F]" />
                <span>Born {fullPerson.date_of_birth}</span>
              </div>
            )}
            {fullPerson.birthplace && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A67C52]" />
                <span>{fullPerson.birthplace}</span>
              </div>
            )}
            {fullPerson.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#D6A756]" />
                <span>{fullPerson.occupation}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biography Section */}
      {fullPerson.biography && (
        <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-subtle space-y-3">
          <h3 className="font-serif text-xl font-bold text-[#1C1917]">Life & Biography</h3>
          <p className="text-[#1C1917] leading-relaxed text-base">{fullPerson.biography}</p>
        </div>
      )}

      {/* Family Relationships Section */}
      <div className="space-y-4">
        <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Family Network</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parents */}
          <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-4">
            <h4 className="flex items-center gap-2 font-serif font-bold text-lg text-[#1C1917]">
              <UserCheck className="w-5 h-5 text-[#3F6B4F]" /> Parents
            </h4>
            {fullPerson.parents && fullPerson.parents.length > 0 ? (
              <div className="space-y-2">
                {fullPerson.parents.map((parent) => (
                  <Link
                    key={parent.id}
                    to={`/people/${parent.id}`}
                    className="p-3 rounded-2xl bg-[#FAFAF9] hover:bg-[#EAF2EC] border border-[#E7E5E4] flex items-center justify-between transition-colors block"
                  >
                    <span className="font-semibold text-[#1C1917]">
                      {parent.first_name} {parent.last_name}
                    </span>
                    <span className="text-xs text-[#78716C] capitalize">{parent.gender}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#78716C] italic">No parent records attached.</p>
            )}
          </div>

          {/* Spouse */}
          <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-4">
            <h4 className="flex items-center gap-2 font-serif font-bold text-lg text-[#1C1917]">
              <Heart className="w-5 h-5 text-[#D6A756]" /> Spouse
            </h4>
            {fullPerson.spouses && fullPerson.spouses.length > 0 ? (
              <div className="space-y-2">
                {fullPerson.spouses.map((spouse) => (
                  <Link
                    key={spouse.id}
                    to={`/people/${spouse.id}`}
                    className="p-3 rounded-2xl bg-[#FAFAF9] hover:bg-[#FAF5EA] border border-[#E7E5E4] flex items-center justify-between transition-colors block"
                  >
                    <span className="font-semibold text-[#1C1917]">
                      {spouse.first_name} {spouse.last_name}
                    </span>
                    <span className="text-xs text-[#78716C] capitalize">{spouse.gender}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#78716C] italic">No spouse records attached.</p>
            )}
          </div>

          {/* Children */}
          <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-4">
            <h4 className="flex items-center gap-2 font-serif font-bold text-lg text-[#1C1917]">
              <Users className="w-5 h-5 text-[#A67C52]" /> Children
            </h4>
            {fullPerson.children && fullPerson.children.length > 0 ? (
              <div className="space-y-2">
                {fullPerson.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/people/${child.id}`}
                    className="p-3 rounded-2xl bg-[#FAFAF9] hover:bg-[#F7F3EE] border border-[#E7E5E4] flex items-center justify-between transition-colors block"
                  >
                    <span className="font-semibold text-[#1C1917]">
                      {child.first_name} {child.last_name}
                    </span>
                    <span className="text-xs text-[#78716C] capitalize">{child.gender}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#78716C] italic">No children records attached.</p>
            )}
          </div>

          {/* Derived Siblings */}
          <div className="bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-serif font-bold text-lg text-[#1C1917]">
                <Users className="w-5 h-5 text-sky-600" /> Siblings
              </h4>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                Derived
              </span>
            </div>
            {fullPerson.siblings && fullPerson.siblings.length > 0 ? (
              <div className="space-y-2">
                {fullPerson.siblings.map((sibling) => (
                  <Link
                    key={sibling.id}
                    to={`/people/${sibling.id}`}
                    className="p-3 rounded-2xl bg-[#FAFAF9] hover:bg-sky-50 border border-[#E7E5E4] flex items-center justify-between transition-colors block"
                  >
                    <span className="font-semibold text-[#1C1917]">
                      {sibling.first_name} {sibling.last_name}
                    </span>
                    <span className="text-xs text-[#78716C] capitalize">{sibling.gender}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#78716C] italic">No derived sibling records.</p>
            )}
          </div>
        </div>
      </div>

      {/* Life Timeline */}
      <div className="bg-white rounded-3xl border border-[#E7E5E4] p-6 sm:p-8 shadow-subtle space-y-6">
        <h3 className="font-serif text-2xl font-bold text-[#1C1917] flex items-center gap-2">
          <Clock className="w-6 h-6 text-[#3F6B4F]" /> Life Event Timeline
        </h3>

        <div className="relative border-l-2 border-[#E7E5E4] ml-4 pl-6 space-y-6">
          {fullPerson.date_of_birth && (
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#3F6B4F] border-4 border-white" />
              <p className="text-xs font-bold text-[#3F6B4F] uppercase">{fullPerson.date_of_birth}</p>
              <h5 className="font-serif font-bold text-base text-[#1C1917] mt-0.5">Birth</h5>
              <p className="text-sm text-[#78716C]">Born in {fullPerson.birthplace || 'Location recorded'}.</p>
            </div>
          )}

          {fullPerson.occupation && (
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#A67C52] border-4 border-white" />
              <p className="text-xs font-bold text-[#A67C52] uppercase">Career</p>
              <h5 className="font-serif font-bold text-base text-[#1C1917] mt-0.5">{fullPerson.occupation}</h5>
              <p className="text-sm text-[#78716C]">Practiced as {fullPerson.occupation}.</p>
            </div>
          )}

          {fullPerson.date_of_death && (
            <div className="relative">
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-stone-700 border-4 border-white" />
              <p className="text-xs font-bold text-stone-700 uppercase">{fullPerson.date_of_death}</p>
              <h5 className="font-serif font-bold text-base text-[#1C1917] mt-0.5">Passed Away</h5>
              <p className="text-sm text-[#78716C]">Remembered in honor.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
