import React from 'react';
import { motion } from 'framer-motion';
import { Person } from '../../types';
import { OrganicTreeNode } from '../../lib/organicTreeLayout';

interface OrganicPersonNodeProps {
  treeNode: OrganicTreeNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (person: Person) => void;
  onHover: (personId: number | null) => void;
}

export const OrganicPersonNode: React.FC<OrganicPersonNodeProps> = ({
  treeNode,
  isSelected,
  isHighlighted,
  onSelect,
  onHover,
}) => {
  const { person, x, y, generation, delay } = treeNode;

  const avatarUrl =
    person.photo_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      person.first_name + ' ' + person.last_name
    )}&background=3F6B4F&color=fff`;

  const isRoot = generation === 1;

  if (treeNode.isUnattached) {
    // UNATTACHED / STANDALONE PERSON (Placed below the tree on the ground)
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          delay: delay,
          duration: 0.5,
          type: 'spring',
        }}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          zIndex: isSelected ? 40 : 25,
        }}
        onMouseEnter={() => onHover(person.id)}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(person);
        }}
        className="flex flex-col items-center cursor-pointer group select-none"
      >
        <div className="relative">
          <div
            className={`w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br from-amber-200 via-stone-200 to-emerald-300 shadow-md group-hover:scale-110 transition-transform ${
              isSelected ? 'ring-4 ring-emerald-500 ring-offset-2' : ''
            }`}
          >
            <img
              src={avatarUrl}
              alt={person.first_name}
              className="w-full h-full rounded-[14px] object-cover border border-white"
            />
          </div>
          <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-sm flex items-center gap-0.5">
            🌱 Yangi
          </span>
        </div>

        <div className="mt-1.5 bg-white/95 text-[#1C1917] border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-serif font-bold shadow group-hover:bg-[#3F6B4F] group-hover:text-white group-hover:border-[#3F6B4F] transition-colors whitespace-nowrap text-center">
          {person.first_name} {person.last_name}
        </div>
      </motion.div>
    );
  }

  // Fruit colors depending on generation for a vibrant fruit tree look
  const fruitGradients = [
    'from-[#3F6B4F] to-[#2D503A]', // Root
    'from-rose-500 to-amber-500',   // Gen 2 (Red Apple / Peach)
    'from-amber-400 to-emerald-500', // Gen 3 (Golden Pear)
    'from-[#3F6B4F] to-[#D6A756]',  // Gen 4 (Emerald Orange)
  ];
  const fruitColor = fruitGradients[(generation - 1) % fruitGradients.length];

  if (isRoot) {
    // ROOT ANCESTOR: Base of the tree trunk with soil & root badges
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: delay,
          duration: 0.6,
          type: 'spring',
          stiffness: 200,
        }}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-50%, -50%)',
          zIndex: 30,
        }}
        onMouseEnter={() => onHover(person.id)}
        onMouseLeave={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(person);
        }}
        className="flex flex-col items-center cursor-pointer group"
      >
        {/* Soil Base Ring */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-[#A67C52] via-[#5C3D2E] to-[#3F6B4F] shadow-xl group-hover:scale-110 transition-transform">
            <img
              src={avatarUrl}
              alt={person.first_name}
              className="w-full h-full rounded-full object-cover border-2 border-amber-200"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-[#A67C52] text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200 shadow">
            🌳 ROOT
          </span>
        </div>

        {/* Name Pill */}
        <div className="mt-2 bg-[#1C1917]/90 text-white backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-serif font-bold shadow-md border border-amber-900/40 group-hover:bg-[#3F6B4F] transition-colors text-center whitespace-nowrap">
          {person.first_name} {person.last_name}
        </div>
      </motion.div>
    );
  }

  // DESCENDANTS: Hanging Fruits from tree branches with stems, leaves & sway animation
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        delay: delay + 0.4,
        duration: 0.6,
        type: 'spring',
        stiffness: 220,
        damping: 18,
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -15%)',
        zIndex: isSelected || isHighlighted ? 40 : 20,
      }}
      onMouseEnter={() => onHover(person.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(person);
      }}
      className="flex flex-col items-center cursor-pointer group select-none"
    >
      {/* Stem hanging from branch */}
      <div className="w-0.5 h-6 bg-[#5C3D2E] relative flex items-center justify-center">
        {/* Leaf on top of fruit stem */}
        <span className="absolute -top-2 -right-2 text-xs group-hover:rotate-12 transition-transform">
          🍃
        </span>
      </div>

      {/* Hanging Fruit Avatar Container */}
      <motion.div
        whileHover={{
          rotate: [-4, 4, -4, 0],
          scale: 1.15,
          transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' },
        }}
        className={`relative p-1 rounded-full bg-gradient-to-br ${fruitColor} shadow-lg ${
          isSelected
            ? 'ring-4 ring-emerald-400 scale-110 shadow-emerald-500/50'
            : isHighlighted
            ? 'ring-4 ring-amber-400 scale-110 shadow-amber-500/50'
            : 'group-hover:shadow-xl'
        }`}
      >
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/90 bg-stone-100">
          <img
            src={avatarUrl}
            alt={person.first_name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Fruit Gloss Highlight Accent */}
        <div className="absolute top-1.5 left-2.5 w-4 h-2 bg-white/40 rounded-full blur-[1px] transform -rotate-45" />

        {person.current_lat != null && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow" title="Active on map" />
        )}
      </motion.div>

      {/* Hanging Name Badge */}
      <div
        className={`mt-1.5 px-3 py-1 rounded-full text-xs font-serif font-bold tracking-tight shadow-md backdrop-blur-md transition-all text-center whitespace-nowrap ${
          isSelected
            ? 'bg-[#3F6B4F] text-white shadow-emerald-900/30'
            : isHighlighted
            ? 'bg-amber-500 text-white shadow-amber-900/30'
            : 'bg-white/95 text-[#1C1917] border border-[#E7E5E4] group-hover:bg-[#3F6B4F] group-hover:text-white group-hover:border-[#3F6B4F]'
        }`}
      >
        {person.first_name} {person.last_name}
      </div>
    </motion.div>
  );
};
