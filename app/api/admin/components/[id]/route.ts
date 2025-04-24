import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prismaService'
import { verifyJWT, getJWTFromRequest } from '@/lib/jwt'
import { 
  createUnauthorizedResponse, 
  createForbiddenResponse, 
  createNotFoundResponse,
  createServerErrorResponse,
  createBadRequestResponse 
} from '@/lib/apiErrors'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomUUID } from 'crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const componentId = params.id
  
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: {
        category: true,
        specValues: {
          include: {
            specKey: true
          }
        }
      }
    })

    if (!component) {
      return createNotFoundResponse('Component not found')
    }

    const specifications: Record<string, string> = { ...(component.specifications as any || {}) }

    for (const specValue of component.specValues) {
      specifications[specValue.specKey.name] = specValue.value
    }

    const formattedComponent = {
      id: component.id,
      name: component.name,
      description: component.description,
      price: component.price,
      stock: component.stock,
      imageUrl: component.imageUrl,
      sku: component.sku,
      categoryId: component.categoryId,
      category: component.category.name,
      specifications,
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString()
    }

    return NextResponse.json(formattedComponent)
  } catch (error) {
    console.error('Error fetching component:', error)
    return createServerErrorResponse('Failed to fetch component details')
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const componentId = params.id

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
    const deleteImage = formData.get('deleteImage') === 'true'

    if (!name || !categoryId || isNaN(price) || isNaN(stock)) {
      return createBadRequestResponse('Missing required fields')
    }

    const existingComponent = await prisma.component.findUnique({
      where: { id: componentId }
    })

    if (!existingComponent) {
      return createNotFoundResponse('Component not found')
    }

    if (sku && sku !== existingComponent.sku) {
      const existingSku = await prisma.component.findUnique({
        where: { sku }
      })
      
      if (existingSku) {
        return createBadRequestResponse('SKU already exists')
      }
    }

    let imageUrl = existingComponent.imageUrl

    if ((deleteImage || image) && existingComponent.imageUrl) {
      try {
        const imagePath = join(process.cwd(), 'public', existingComponent.imageUrl)
        if (existsSync(imagePath)) {
          await unlink(imagePath)
        }
        
        if (deleteImage) {
          imageUrl = null
        }
      } catch (error) {
        console.error('Error deleting old image:', error)
      }
    }

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

    const updatedComponent = await prisma.component.update({
      where: { id: componentId },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        sku,
        specifications,
        imageUrl,
      },
      include: {
        category: true
      }
    })

    await prisma.componentSpec.deleteMany({
      where: { componentId }
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
              categoryId
            }
          })
        }

        await prisma.componentSpec.create({
          data: {
            id: randomUUID(),
            componentId,
            specKeyId: specKey.id,
            value: value as string
          }
        })
      }
    }

    return NextResponse.json({
      id: updatedComponent.id,
      name: updatedComponent.name,
      description: updatedComponent.description,
      price: updatedComponent.price,
      stock: updatedComponent.stock,
      categoryId: updatedComponent.categoryId,
      category: updatedComponent.category.name,
      sku: updatedComponent.sku,
      imageUrl: updatedComponent.imageUrl,
      specifications
    })
  } catch (error) {
    console.error('Error updating component:', error)
    return createServerErrorResponse('Failed to update component')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  try {
    const token = getJWTFromRequest(request)
    if (!token) {
      return createUnauthorizedResponse('Authentication required')
    }

    const payload = await verifyJWT(token)
    if (!payload || payload.role !== 'ADMIN') {
      return createForbiddenResponse('Admin access required')
    }

    const componentId = params.id
 
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      include: {
        configItems: true
      }
    })

    if (!component) {
      return createNotFoundResponse('Component not found')
    }
  
    if (component.configItems.length > 0) {
      return createBadRequestResponse('Cannot delete component because it is used in configurations')
    }

    if (component.imageUrl) {
      try {
        const imagePath = join(process.cwd(), 'public', component.imageUrl)
        if (existsSync(imagePath)) {
          await unlink(imagePath)
        }
      } catch (error) {
        console.error('Error deleting component image:', error)
      }
    }

    await prisma.componentSpec.deleteMany({
      where: { componentId }
    })

    await prisma.component.delete({
      where: { id: componentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting component:', error)
    return createServerErrorResponse('Failed to delete component')
  }
}