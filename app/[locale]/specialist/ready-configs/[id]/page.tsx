'use client';

import SpecialistReadyConfigForm from '@/components/Specialist/ReadyConfigForm';
import { useParams } from 'next/navigation';

export default function SpecialistEditReadyConfigPage() {
  const params = useParams();
  const configId = params.id as string;
  
  return <SpecialistReadyConfigForm configId={configId} isEditMode={true} />;
}