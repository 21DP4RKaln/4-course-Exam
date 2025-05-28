'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Search, Eye, Edit, Trash2, Plus, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/app/components/ui/badge'
import { useTranslations } from 'next-intl'
import Loading from '@/app/components/ui/Loading'

interface ReadyMadePC {
  id: string
  name: string
  category: string
  price: number
  status: string
  isPublic: boolean
  viewCount: number
  createdAt: string
}

export default function ReadyMadePCsPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const [pcs, setPCs] = useState<ReadyMadePC[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const t = useTranslations()

  useEffect(() => {
    fetchReadyMadePCs()
  }, [])

  const fetchReadyMadePCs = async () => {
    try {
      const response = await fetch('/api/specialist/products/ready-made')
      if (response.ok) {
        const data = await response.json()
        setPCs(data)
      }
    } catch (error) {
      console.error('Error fetching ready-made PCs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PC configuration?')) return

    try {
      const response = await fetch(`/api/specialist/products/ready-made/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPCs(pcs.filter(pc => pc.id !== id))
      }
    } catch (error) {
      console.error('Error deleting PC:', error)
    }
  }

  const filteredPCs = pcs.filter(pc => {
    if (selectedCategory && pc.category !== selectedCategory) return false
    if (selectedStatus && pc.status !== selectedStatus) return false
    if (searchQuery && !pc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="medium" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          {t('staff.readyPCs')}
        </h1>
        <Link href={`/${locale}/specialist/configurations/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('configurator.createNewPC')}
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <input
            type="text"
            placeholder={t('shop.filters.searchPlaceholder')}
            className="pl-10 pr-4 py-2 w-full border rounded-lg dark:bg-neutral-800 dark:border-neutral-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-neutral-800 dark:border-neutral-700"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">{t('shop.filters.allCategories')}</option>
          <option value="gaming">{t('shop.filters.gaming')}</option>
          <option value="workstation">{t('shop.filters.workstation')}</option>
          <option value="office">{t('shop.filters.office')}</option>
          <option value="budget">{t('shop.filters.budget')}</option>
        </select>
        <select
          className="border rounded-lg px-4 py-2 dark:bg-neutral-800 dark:border-neutral-700"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">{t('shop.filters.allStatus')}</option>
          <option value="DRAFT">{t('shop.filters.draft')}</option>
          <option value="APPROVED">{t('shop.filters.approved')}</option>
          <option value="PUBLISHED">{t('shop.filters.published')}</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-neutral-50 dark:bg-neutral-800">
                  <th className="px-6 py-3 text-left">{t('shop.table.name')}</th>
                  <th className="px-6 py-3 text-left">{t('shop.table.category')}</th>
                  <th className="px-6 py-3 text-right">{t('shop.table.price')}</th>
                  <th className="px-6 py-3 text-center">{t('shop.table.status')}</th>
                  <th className="px-6 py-3 text-center">{t('shop.table.visibility')}</th>
                  <th className="px-6 py-3 text-center">{t('shop.table.views')}</th>
                  <th className="px-6 py-3 text-center">{t('shop.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPCs.map((pc) => (
                  <tr key={pc.id} className="border-b">
                    <td className="px-6 py-4">{pc.name}</td>
                    <td className="px-6 py-4 capitalize">{pc.category}</td>
                    <td className="px-6 py-4 text-right">€{pc.price}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={
                        pc.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        pc.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        'bg-neutral-100 text-neutral-800'
                      }>
                        {pc.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={pc.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {pc.isPublic ? t('shop.table.public') : t('shop.table.private')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">{pc.viewCount}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link href={`/${locale}/specialist/ready-made/${pc.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/specialist/configurations/${pc.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/${locale}/shop/product/${pc.id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(pc.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}