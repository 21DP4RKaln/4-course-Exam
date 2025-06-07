'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateConfigurationPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/specialist/configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          components: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/specialist/configurations/${data.id}/edit`);
      }
    } catch (error) {
      console.error('Error creating configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Configuration Name
              </label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Configuration'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
