import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/middleware/authMiddleware'
import { createBadRequestResponse, createServerErrorResponse } from '@/lib/apiErrors'
import { saveConfiguration } from '@/lib/services/configuratorService'
import { z } from 'zod'

const configurationSchema = z.object({
  name: z.string().min(1, 'Configuration name is required'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  components: z.array(
    z.object({
      id: z.string().uuid(),
      quantity: z.number().int().positive()
    })
  ).min(1, 'At least one component is required')
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Configuration save API called');
    
    const authResult = await authenticate(request)
    if (authResult instanceof Response) {
      console.log('❌ Authentication failed');
      return authResult
    }
    
    console.log('✅ User authenticated:', { userId: authResult.userId, email: authResult.email });
    
    const body = await request.json()
    console.log('📝 Request body received:', body);
    
    const validationResult = configurationSchema.safeParse(body)
    
    if (!validationResult.success) {
      console.log('❌ Validation failed:', validationResult.error.format());
      return createBadRequestResponse(
        'Invalid configuration data',
        validationResult.error.format()
      )
    }
    
    const data = validationResult.data
    console.log('✅ Data validated successfully:', data);
    
    const configuration = await saveConfiguration(authResult.userId, {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      components: data.components
    })
    
    console.log('✅ Configuration saved:', { id: configuration.id, name: configuration.name });
    
    return NextResponse.json({
      message: 'Configuration saved successfully',
      configuration: {
        id: configuration.id,
        name: configuration.name,
        totalPrice: configuration.totalPrice
      }
    }, { status: 201 })  } catch (error) {
    console.error('🚨 Error saving configuration:', error)
    return createServerErrorResponse('Failed to save configuration')
  }
}
