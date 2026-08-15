import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Person } from '../../types';
import { Badge } from '../ui/Badge';

export const PersonNode = memo(({ data, selected }: NodeProps) => {
  const person = data as unknown as Person;

  const isDeceased = Boolean(person.date_of_death);
  const birthYear = person.date_of_birth ? person.date_of_birth.split('-')[0] : '';
  const deathYear = person.date_of_death ? person.date_of_death.split('-')[0] : '';
  const lifeSpan = birthYear ? `${birthYear} – ${deathYear}` : '';

  const genderBorderColor =
    person.gender === 'male'
      ? 'border-l-4 border-l-sky-500'
      : person.gender === 'female'
      ? 'border-l-4 border-l-rose-500'
      : 'border-l-4 border-l-purple-500';

  return (
    <div
      className={`relative w-[250px] bg-white rounded-2xl border transition-all duration-200 p-3.5 shadow-subtle hover:shadow-card cursor-pointer ${genderBorderColor} ${
        selected ? 'border-[#3F6B4F] ring-2 ring-[#3F6B4F]/30 shadow-card' : 'border-[#E7E5E4]'
      }`}
    >
      {/* Top Handle for Parent Connection */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-[#3F6B4F] border-2 border-white"
      />

      <div className="flex items-center gap-3">
        {/* Photo Avatar */}
        <div className="relative flex-shrink-0">
          {person.photo_url ? (
            <img
              src={person.photo_url}
              alt={`${person.first_name} ${person.last_name}`}
              className="w-12 h-12 rounded-full object-cover border border-[#E7E5E4]"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#FAFAF9] border border-[#E7E5E4] flex items-center justify-center text-[#78716C] font-serif font-semibold text-lg">
              {person.first_name[0]}
              {person.last_name[0]}
            </div>
          )}
          {isDeceased && (
            <span
              className="absolute -bottom-1 -right-1 bg-stone-700 text-white text-[10px] px-1 py-0.2 rounded-full font-bold"
              title="Deceased"
            >
              †
            </span>
          )}
        </div>

        {/* Text Details */}
        <div className="min-w-0 flex-1">
          <h4 className="font-serif text-sm font-semibold text-[#1C1917] truncate leading-tight">
            {person.first_name} {person.middle_name ? `${person.middle_name[0]}. ` : ''}{person.last_name}
          </h4>
          {lifeSpan && (
            <p className="text-xs text-[#78716C] font-medium mt-0.5">{lifeSpan}</p>
          )}
          {person.occupation && (
            <p className="text-[11px] text-[#A67C52] font-medium truncate mt-0.5">
              {person.occupation}
            </p>
          )}
        </div>
      </div>

      {/* Gender & Generation Badge */}
      <div className="mt-2.5 pt-2 border-t border-[#F5F5F4] flex items-center justify-between text-[10px]">
        <Badge variant={person.gender}>
          {person.gender}
        </Badge>
        {person.generation && (
          <span className="text-[#78716C] font-medium">Gen {person.generation}</span>
        )}
      </div>

      {/* Bottom Handle for Children Connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-[#3F6B4F] border-2 border-white"
      />
    </div>
  );
});

PersonNode.displayName = 'PersonNode';
