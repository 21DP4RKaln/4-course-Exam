import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, getConfigCategory } from '@/lib/services/unifiedProductService'
import type { ConfigurationType } from '@/lib/services/unifiedProductService'

function extractOptionsFromConfigs(configs: ConfigurationType[], specKey: string) {
  const optionsSet = new Set<string>()
  configs.forEach(cfg => {
    cfg.components.forEach(item => {
      if (item.category.toLowerCase() === specKey.toLowerCase()) {
        optionsSet.add(item.name)
      }
    })
  })
  return Array.from(optionsSet).map(value => ({ id: value, name: value }))
}

export async function GET(request: NextRequest) {
  try {
    const result = await getAllProducts({ page: 1, limit: 1000, type: 'configuration' })
    const configs = result.products as ConfigurationType[]

    const categorySet = new Set<string>()
    configs.forEach(cfg => {
      const specs: Record<string, string> = {}
      cfg.components.forEach(item => {
        specs[item.category.toLowerCase()] = item.name
      })
      categorySet.add(getConfigCategory(specs))
    })
    const categories = Array.from(categorySet).map(v => ({ 
      id: v, 
      name: v,
      translationKey: `shop.filters.${v}`
    }))

    const cpu = extractOptionsFromConfigs(configs, 'cpu')
    const gpu = extractOptionsFromConfigs(configs, 'gpu')
    const ram = extractOptionsFromConfigs(configs, 'ram')
    const storage = extractOptionsFromConfigs(configs, 'storage')
    const motherboard = extractOptionsFromConfigs(configs, 'motherboard')
    const psu = extractOptionsFromConfigs(configs, 'psu')
    const caseOpts = extractOptionsFromConfigs(configs, 'case')
    const cooling = extractOptionsFromConfigs(configs, 'cooling')

    return NextResponse.json({ categories, cpu, gpu, ram, storage, motherboard, psu, case: caseOpts, cooling })
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
