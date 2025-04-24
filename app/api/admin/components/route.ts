import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createServerErrorResponse,
  createBadRequestResponse 
} from '@/lib/apiErrors'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const components = await prisma.component.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedComponents = components.map(component => ({
      id: component.id,
      name: component.name,
      category: component.category.name,
      price: component.price,
      stock: component.stock,
      imageUrl: component.imageUrl,
      createdAt: component.createdAt.toISOString()
    }))

    return NextResponse.json(formattedComponents)
  } catch (error) {
    console.error('Error fetching components:', error)
    return createServerErrorResponse('Failed to fetch components')
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const formData = await request.formData()

    const name = formData.get('name') as string
    const description = formData.get('description') as string || null
    const price = parseFloat(formData.get('price') as string)
    const stock = parseInt(formData.get('stock') as string)
    const categoryId = formData.get('categoryId') as string
    const sku = formData.get('sku') as string || null
    const specificationsString = formData.get('specifications') as string
    const specifications = specificationsString ? JSON.parse(specificationsString) : {}
    const image = formData.get('image') as File | null

    if (!name || !categoryId || isNaN(price) || isNaN(stock)) {
      return createBadRequestResponse('Missing required fields')
    }

    const categoryExists = await prisma.componentCategory.findUnique({
      where: { id: categoryId }
    })
    
    if (!categoryExists) {
      return createBadRequestResponse('Invalid category')
    }

    if (sku) {
      const existingSku = await prisma.component.findUnique({
        where: { sku }
      })
      
      if (existingSku) {
        return createBadRequestResponse('SKU already exists')
      }
    }

    const componentSku = sku || `${categoryId.substring(0, 3).toUpperCase()}-${Date.now().toString().substring(7)}`

    let imageUrl = null
    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const originalName = image.name
      const extension = originalName.split('.').pop() || 'jpg'
      const filename = `${randomUUID()}.${extension}`

      const uploadDir = join(process.cwd(), 'public', 'uploads', 'components')
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      
      const imagePath = join(uploadDir, filename)
      await writeFile(imagePath, buffer)
   
      imageUrl = `/uploads/components/${filename}`
    }
  
    const component = await prisma.component.create({
      data: {
        id: randomUUID(),
        name,
        description,
        price,
        stock,
        categoryId,
        sku: componentSku,
        specifications,
        imageUrl,
      },
      include: {
        category: true
      }
    })

    if (Object.keys(specifications).length > 0) {
      for (const [key, value] of Object.entries(specifications)) {
        let specKey = await prisma.specificationKey.findFirst({
          where: { name: key }
        })
        
        if (!specKey) {
          specKey = await prisma.specificationKey.create({
            data: {
              id: randomUUID(),
              name: key,
              displayName: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
              categoryId: categoryId
            }
          })
        }

        await prisma.componentSpec.create({
          data: {
            id: randomUUID(),
            componentId: component.id,
            specKeyId: specKey.id,
            value: value as string
          }
        })
      }
    }

    return NextResponse.json({
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price,
      stock: component.stock,
      categoryId: component.categoryId,
      category: component.category.name,
      sku: component.sku,
      imageUrl: component.imageUrl,
      specifications
    })
  } catch (error) {
    console.error('Error creating component:', error)
    return createServerErrorResponse('Failed to create component')
  }
}