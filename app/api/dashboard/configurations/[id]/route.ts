import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromRequest } from '@/lib/auth/jwt';
import {
  createUnauthorizedResponse,
  createNotFoundResponse,
  createServerErrorResponse,
} from '@/lib/apiErrors';
import { getConfigurationById } from '@/lib/services/dashboardService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getJWTFromRequest(request);
    if (!token) {
      return createUnauthorizedResponse('Authentication required');
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return createUnauthorizedResponse('Invalid token');
    }

    const userId = payload.userId;
    const configId = params.id;
    const configuration = await getConfigurationById(configId, userId);

    if (!configuration) {
      return createNotFoundResponse('Configuration not found');
    }

    return NextResponse.json(configuration);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    return createServerErrorResponse('Failed to fetch configuration details');
  }
}
