'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, Upload, Camera } from 'lucide-react'

interface RepairCompletionFormProps {
  repair: {
    id: string
    title: string
    estimatedCost: number | null
  }
  onClose: () => void
  onComplete: () => void
}

export function RepairCompletionForm({ repair, onClose, onComplete }: RepairCompletionFormProps) {
  const t = useTranslations()
  const [finalCost, setFinalCost] = useState(repair.estimatedCost?.toString() || '')
  const [completionNotes, setCompletionNotes] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('finalCost', finalCost)
      formData.append('completionNotes', completionNotes)
      if (image) {
        formData.append('image', image)
      }

      const response = await fetch(`/api/staff/repairs/${repair.id}/complete`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to complete repair')

      onComplete()
    } catch (error) {
      console.error('Error completing repair:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('repairs.completeRepair')}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t('repairs.finalCost')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">€</span>
              <input
                type="number"
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                className="w-full border rounded-lg pl-8 pr-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                step="0.01"
                min="0"
                required
              />
            </div>
            {repair.estimatedCost && (
              <p className="text-sm text-gray-500 mt-1">
                {t('repairs.estimatedCost')}: €{repair.estimatedCost.toFixed(2)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('repairs.completionNotes')}
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              placeholder={t('repairs.completionNotesPlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t('repairs.attachImage')}
            </label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary/80">
                      <span>{t('common.uploadFile')}</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">{t('common.orDragAndDrop')}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t('common.imageFormats')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? t('common.completing') : t('repairs.completeRepair')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}