import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { success, error, unauthorized } from '@/lib/api-response';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return unauthorized('Unauthorized');
  }

  try {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        packages: {
          include: {
            versions: { orderBy: { publishedAt: 'desc' }, take: 1 }
          }
        },
        orgMemberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (!fullUser) {
      return error('NOT_FOUND', 'User not found', 404);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = fullUser;

    return success(safeUser);
  } catch (err: any) {
    return error('INTERNAL_ERROR', err.message || 'Internal Server Error', 500);
  }
}
