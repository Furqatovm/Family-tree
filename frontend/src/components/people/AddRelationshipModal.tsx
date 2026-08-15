import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select as AntSelect } from 'antd';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Person } from '../../types';

const relationshipSchema = z.object({
  person_1_id: z.coerce.number().min(1, 'Person 1 is required'),
  relationship_type: z.enum([
    'parent',
    'child',
    'spouse',
    'sibling',
    'grandparent',
    'grandchild',
    'relative',
  ]),
  person_2_id: z.coerce.number().min(1, 'Person 2 is required'),
}).refine(data => data.person_1_id !== data.person_2_id, {
  message: 'Bir shaxs o\'zi bilan munosabat o\'rnata olmaydi',
  path: ['person_2_id'],
});

export type RelationshipFormData = z.infer<typeof relationshipSchema>;

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RelationshipFormData) => Promise<void>;
  people: Person[];
  preselectedPerson?: Person | null;
  isLoading?: boolean;
}

export const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  people,
  preselectedPerson,
  isLoading = false,
}) => {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RelationshipFormData>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      person_1_id: preselectedPerson?.id || (people[0]?.id ?? 0),
      relationship_type: 'parent',
      person_2_id: people.find(p => p.id !== preselectedPerson?.id)?.id || (people[1]?.id ?? 0),
    },
  });

  useEffect(() => {
    if (isOpen) {
      const p1 = preselectedPerson?.id || (people[0]?.id ?? 0);
      const p2 = people.find(p => p.id !== p1)?.id || (people[1]?.id ?? 0);
      reset({
        person_1_id: p1,
        relationship_type: 'parent',
        person_2_id: p2,
      });
    }
  }, [isOpen, preselectedPerson, people, reset]);

  const p1Id = watch('person_1_id');
  const relType = watch('relationship_type');
  const p2Id = watch('person_2_id');

  const p1 = people.find(p => p.id === Number(p1Id));
  const p2 = people.find(p => p.id === Number(p2Id));

  const p1Name = p1 ? `${p1.first_name} ${p1.last_name}` : 'Birinchi Shaxs';
  const p2Name = p2 ? `${p2.first_name} ${p2.last_name}` : 'Ikkinchi Shaxs';

  const personOptions = people.map(p => ({
    value: p.id,
    label: `${p.first_name} ${p.last_name} (${p.gender === 'male' ? 'Erkak' : 'Ayol'})`,
  }));

  const handleFormSubmit = async (data: RelationshipFormData) => {
    await onSubmit(data);
    onClose();
  };

  const getExplanationText = () => {
    switch (relType) {
      case 'parent':
        return (
          <p>
            <strong className="text-[#3F6B4F]">{p1Name}</strong> shaxsi{' '}
            <strong className="text-[#3F6B4F]">{p2Name}</strong> shaxsining 👨‍👩‍👧 <strong>Otasi / Onasi (Parent)</strong> bo'ladi.
          </p>
        );
      case 'child':
        return (
          <p>
            <strong className="text-[#3F6B4F]">{p1Name}</strong> shaxsi{' '}
            <strong className="text-[#3F6B4F]">{p2Name}</strong> shaxsining 👶 <strong>Farzandi (O'g'il / Qiz)</strong> bo'ladi.
          </p>
        );
      case 'spouse':
        return (
          <p>
            <strong className="text-amber-700">{p1Name}</strong> va{' '}
            <strong className="text-amber-700">{p2Name}</strong> 💍 <strong>Turmush O'rtoqlari (Spouses)</strong> bo'lishadi.
          </p>
        );
      case 'sibling':
        return (
          <p>
            <strong className="text-blue-700">{p1Name}</strong> va{' '}
            <strong className="text-blue-700">{p2Name}</strong> 👫 <strong>Aka / Uka / Opa / Singil (Siblings)</strong> bo'lishadi.
          </p>
        );
      case 'grandparent':
        return (
          <p>
            <strong className="text-purple-700">{p1Name}</strong> shaxsi{' '}
            <strong className="text-purple-700">{p2Name}</strong> shaxsining 👴 <strong>Bobosi / Buvisi (Grandparent)</strong> bo'ladi.
          </p>
        );
      case 'grandchild':
        return (
          <p>
            <strong className="text-[#3F6B4F]">{p1Name}</strong> shaxsi{' '}
            <strong className="text-[#3F6B4F]">{p2Name}</strong> shaxsining 🧒 <strong>Nevarasi (Grandchild)</strong> bo'ladi.
          </p>
        );
      case 'relative':
        return (
          <p>
            <strong className="text-[#57534E]">{p1Name}</strong> va{' '}
            <strong className="text-[#57534E]">{p2Name}</strong> 🤝 <strong>Oila Qarindoshi (Relative)</strong> deb bog'lanadi.
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Oila Qarindoshlik Munosabatini Qo'shish"
      subtitle="Ikki oila a'zosi o'rtasidagi barcha turdagi qarindoshlik rishtalarini bog'lang"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Person 1 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            1-Oila A'zosi *
          </label>
          <AntSelect
            showSearch
            optionFilterProp="label"
            value={watch('person_1_id')}
            onChange={(val) => setValue('person_1_id', val)}
            className="w-full h-10 font-sans text-sm"
            options={personOptions}
          />
          {errors.person_1_id && (
            <p className="text-xs text-rose-600 mt-1">{errors.person_1_id.message}</p>
          )}
        </div>

        {/* Relationship Type */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Qarindoshlik Turi (Relationship Role) *
          </label>
          <AntSelect
            value={watch('relationship_type')}
            onChange={(val) => setValue('relationship_type', val)}
            className="w-full h-10 font-sans text-sm"
            options={[
              { value: 'parent', label: '👨‍👩‍👧 Ota / Ona (Parent)' },
              { value: 'child', label: '👶 Farzand - O\'g\'il / Qiz (Child)' },
              { value: 'spouse', label: '💍 Turmush o\'rtog\'i (Spouse)' },
              { value: 'sibling', label: '👫 Aka / Uka / Opa / Singil (Sibling)' },
              { value: 'grandparent', label: '👴 Bobo / Buva (Grandparent)' },
              { value: 'grandchild', label: '🧒 Nevara (Grandchild)' },
              { value: 'relative', label: '🤝 Qarindosh (Relative / Cousin)' },
            ]}
          />
          {errors.relationship_type && (
            <p className="text-xs text-rose-600 mt-1">{errors.relationship_type.message}</p>
          )}
        </div>

        {/* Person 2 */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            2-Oila A'zosi *
          </label>
          <AntSelect
            showSearch
            optionFilterProp="label"
            value={watch('person_2_id')}
            onChange={(val) => setValue('person_2_id', val)}
            className="w-full h-10 font-sans text-sm"
            options={personOptions}
          />
          {errors.person_2_id && (
            <p className="text-xs text-rose-600 mt-1">{errors.person_2_id.message}</p>
          )}
        </div>

        {/* Dynamic Plain Text Explanation */}
        <div className="bg-[#FAFAF9] border border-[#E7E5E4] p-3.5 rounded-2xl text-xs text-[#57534E] leading-relaxed shadow-sm">
          {getExplanationText()}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} className="bg-[#3F6B4F] hover:bg-[#345A42] font-bold">
            Munosabatni Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
};
