import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select as AntSelect, Upload as AntUpload, Button as AntButton } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Person } from '../../types';
import { toast } from '../ui/CustomToast';

const personSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required').max(50),
  gender: z.enum(['male', 'female', 'other']),
  date_of_birth: z.string().optional(),
  date_of_death: z.string().optional(),
  birthplace: z.string().optional(),
  occupation: z.string().optional(),
  biography: z.string().optional(),
  photo_url: z.string().optional().or(z.literal('')),
});

export type PersonFormData = z.infer<typeof personSchema>;

interface AddEditPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PersonFormData) => Promise<void>;
  person?: Person | null;
  isLoading?: boolean;
}

export const AddEditPersonModal: React.FC<AddEditPersonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  person,
  isLoading = false,
}) => {
  const isEditing = Boolean(person);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      gender: 'male',
      date_of_birth: '',
      date_of_death: '',
      birthplace: '',
      occupation: '',
      biography: '',
      photo_url: '',
    },
  });

  useEffect(() => {
    if (person) {
      reset({
        first_name: person.first_name || '',
        middle_name: person.middle_name || '',
        last_name: person.last_name || '',
        gender: person.gender || 'male',
        date_of_birth: person.date_of_birth || '',
        date_of_death: person.date_of_death || '',
        birthplace: person.birthplace || '',
        occupation: person.occupation || '',
        biography: person.biography || '',
        photo_url: person.photo_url || '',
      });
    } else {
      reset({
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: 'male',
        date_of_birth: '',
        date_of_death: '',
        birthplace: '',
        occupation: '',
        biography: '',
        photo_url: '',
      });
    }
  }, [person, reset, isOpen]);

  const currentPhotoUrl = watch('photo_url');

  const handleFormSubmit = async (data: PersonFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Family Member' : 'Add Family Member'}
      subtitle={
        isEditing
          ? 'Update profile details for this person'
          : 'Enter person details to add them to your family tree'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="First Name *"
            placeholder="Arthur"
            {...register('first_name')}
            error={errors.first_name?.message}
          />
          <Input
            label="Middle Name"
            placeholder="Edward"
            {...register('middle_name')}
            error={errors.middle_name?.message}
          />
          <Input
            label="Last Name *"
            placeholder="Sterling"
            {...register('last_name')}
            error={errors.last_name?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
              Jinsi (Gender) *
            </label>
            <AntSelect
              value={watch('gender')}
              onChange={(val) => setValue('gender', val as 'male' | 'female' | 'other')}
              className="w-full h-10 font-sans text-sm"
              options={[
                { value: 'male', label: '👨 Erkak (Male)' },
                { value: 'female', label: '👩 Ayol (Female)' },
                { value: 'other', label: '👤 Boshqa (Other)' },
              ]}
            />
            {errors.gender && (
              <p className="text-xs text-rose-600 mt-1">{errors.gender.message}</p>
            )}
          </div>
          <Input
            label="Date of Birth"
            type="date"
            {...register('date_of_birth')}
            error={errors.date_of_birth?.message}
          />
          <Input
            label="Date of Death (if applicable)"
            type="date"
            {...register('date_of_death')}
            error={errors.date_of_death?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Birthplace"
            placeholder="Boston, MA"
            {...register('birthplace')}
            error={errors.birthplace?.message}
          />
          <Input
            label="Occupation"
            placeholder="Architect & Builder"
            {...register('occupation')}
            error={errors.occupation?.message}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Photo (Rasm / Havola)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Live Image Preview Thumbnail */}
            <div className="w-10 h-10 rounded-xl border border-[#E7E5E4] bg-[#FAFAF9] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-all">
              {currentPhotoUrl ? (
                <img
                  src={currentPhotoUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Preview&background=3F6B4F&color=fff';
                  }}
                />
              ) : (
                <span className="text-base text-[#A8A29E]" title="Rasm yuklanganda ko'rinadi">📷</span>
              )}
            </div>

            <div className="flex-1 w-full">
              <Input
                placeholder="https://images.unsplash.com/..."
                {...register('photo_url')}
                error={errors.photo_url?.message}
              />
            </div>
            <AntUpload
              beforeUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = new Image();
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                      if (width > MAX_SIZE) {
                        height = Math.round((height * MAX_SIZE) / width);
                        width = MAX_SIZE;
                      }
                    } else {
                      if (height > MAX_SIZE) {
                        width = Math.round((width * MAX_SIZE) / height);
                        height = MAX_SIZE;
                      }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(img, 0, 0, width, height);
                      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                      setValue('photo_url', compressedBase64);
                      toast.success('Rasm muvaffaqiyatli yuklandi va siqildi! 📸');
                    } else {
                      setValue('photo_url', event.target?.result as string);
                    }
                  };
                  img.src = event.target?.result as string;
                };
                reader.readAsDataURL(file);
                return false; // Prevent automatic HTTP post by Antd
              }}
              showUploadList={false}
              accept="image/*"
            >
              <AntButton
                icon={<UploadOutlined />}
                className="h-10 border-[#3F6B4F] text-[#3F6B4F] hover:bg-[#3F6B4F]/10 font-semibold flex items-center gap-1"
              >
                Rasm Yuklash
              </AntButton>
            </AntUpload>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#78716C]">
            Biography / Life Story
          </label>
          <textarea
            rows={3}
            className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder-[#A8A29E] focus:border-[#3F6B4F] focus:outline-none focus:ring-2 focus:ring-[#3F6B4F]/20"
            placeholder="Share key life milestones, achievements, or anecdotes..."
            {...register('biography')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E5E4]">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Person'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
