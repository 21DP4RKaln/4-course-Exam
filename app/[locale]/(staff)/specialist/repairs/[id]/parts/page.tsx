'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';

interface Component {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

interface RepairPart {
  id: string;
  componentId: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
}

interface PartToAdd {
  componentId: string;
  quantity: number;
  price: number;
}

export default function RepairPartsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [existingParts, setExistingParts] = useState<RepairPart[]>([]);
  const [partsToAdd, setPartsToAdd] = useState<PartToAdd[]>([]);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRepairDetails();
    fetchComponents();
  }, [params.id]);

  const fetchRepairDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/repairs/${params.id}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setExistingParts(data.parts || []);
    } catch (error) {
      console.error('Error fetching repair details:', error);
      setError('Failed to load repair details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/staff/components');

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setComponents(data);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const addPart = () => {
    if (!selectedComponent) {
      setError('Please select a component');
      return;
    }

    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!price || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    setPartsToAdd([
      ...partsToAdd,
      {
        componentId: selectedComponent,
        quantity,
        price: Number(price),
      },
    ]);

    setSelectedComponent('');
    setQuantity(1);
    setPrice('');
    setError(null);
  };

  const removePart = (index: number) => {
    const newParts = [...partsToAdd];
    newParts.splice(index, 1);
    setPartsToAdd(newParts);
  };

  const handleComponentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const componentId = e.target.value;
    setSelectedComponent(componentId);

    // Auto-fill price based on selected component
    if (componentId) {
      const component = components.find(c => c.id === componentId);
      if (component) {
        setPrice(component.price);
      }
    } else {
      setPrice('');
    }
  };

  const saveParts = async () => {
    if (partsToAdd.length === 0) {
      setError('No parts to add');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/staff/repairs/${params.id}/parts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parts: partsToAdd }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add parts');
      }

      setSuccessMessage('Parts added successfully');
      setPartsToAdd([]);
      await fetchRepairDetails();
    } catch (error: any) {
      console.error('Error adding parts:', error);
      setError(error.message || 'Failed to add parts');
    } finally {
      setSaving(false);
    }
  };

  const getComponentName = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    return component ? component.name : 'Unknown Component';
  };

  const getComponentCategory = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    return component ? component.category : 'Unknown Category';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/specialist/repairs/${params.id}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repair
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Manage Repair Parts
        </h1>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Parts</CardTitle>
            </CardHeader>
            <CardContent>
              {existingParts.length > 0 ? (
                <div className="overflow-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Component
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      {existingParts.map(part => (
                        <tr key={part.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {part.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {part.category}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {part.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            €{part.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            €{(part.price * part.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-medium">
                        <td colSpan={4} className="px-4 py-3 text-right">
                          Total:
                        </td>
                        <td className="px-4 py-3 text-right">
                          €
                          {existingParts
                            .reduce(
                              (total, part) =>
                                total + part.price * part.quantity,
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No parts added to this repair yet
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Parts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="component">Component</Label>
                  <select
                    id="component"
                    className="w-full border rounded-md px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
                    value={selectedComponent}
                    onChange={handleComponentChange}
                  >
                    <option value="">Select a component</option>
                    {components.map(component => (
                      <option key={component.id} value={component.id}>
                        {component.name} ({component.category}) - €
                        {component.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setQuantity(parseInt(e.target.value) || 1)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPrice(parseFloat(e.target.value) || '')
                    }
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={addPart} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to List
                  </Button>
                </div>
              </div>

              {partsToAdd.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Parts to Add:</h3>
                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Component
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {partsToAdd.map((part, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {getComponentName(part.componentId)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {getComponentCategory(part.componentId)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {part.quantity}
                            </td>
                            <td className="px-4 py-3 text-right">
                              €{part.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              €{(part.price * part.quantity).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removePart(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="font-medium">
                          <td colSpan={4} className="px-4 py-3 text-right">
                            Total to add:
                          </td>
                          <td className="px-4 py-3 text-right">
                            €
                            {partsToAdd
                              .reduce(
                                (total, part) =>
                                  total + part.price * part.quantity,
                                0
                              )
                              .toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={saveParts}
                disabled={partsToAdd.length === 0 || saving}
                className="w-full"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Parts
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Adding Parts Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <p>
                Add any parts that need to be used in this repair. These will be
                added to the final repair cost.
              </p>

              <div className="space-y-2">
                <h3 className="font-medium">How to add parts:</h3>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Select a component from the dropdown</li>
                  <li>Enter the quantity needed</li>
                  <li>
                    Adjust the price if needed (default is the standard price)
                  </li>
                  <li>Click "Add to List" to add it to your basket</li>
                  <li>
                    When finished, click "Save Parts" to add them to the repair
                  </li>
                </ol>
              </div>

              <p className="text-neutral-500 italic">
                Note: Adding parts will not affect inventory levels until the
                repair is completed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
