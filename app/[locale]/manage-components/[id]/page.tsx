'use client';

import ComponentForm from '@/components/Admin/ComponentForm';
import { useParams } from 'next/navigation';

export default function EditComponentPage() {
  const params = useParams();
  const componentId = params.id as string;
  
  return <ComponentForm componentId={componentId} isEditMode={true} />;
}