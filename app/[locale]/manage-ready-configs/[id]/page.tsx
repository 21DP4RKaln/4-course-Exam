'use client';

import ReadyConfigForm from '../../../../components/Admin/ReadyConfigForm';
import { useParams } from 'next/navigation';

export default function EditReadyConfigPage() {
  const params = useParams();
  const configId = params.id as string;
  
  return <ReadyConfigForm configId={configId} isEditMode={true} />;
}