import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { success, error, unauthorized } from '@/lib/api-response';

const UpdateSettingsSchema = z.object({
  openaiKey: z.string().optional(),
  anthropicKey: z.string().optional(),
  googleKey: z.string().optional(),
  ollamaUrl: z.string().url().optional(),
  defaultModel: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.userId },
  });

  // Return redacted keys
  const redacted = settings
    ? {
        openaiKey: settings.openaiKey ? '••••' + settings.openaiKey.slice(-4) : null,
        anthropicKey: settings.anthropicKey ? '••••' + settings.anthropicKey.slice(-4) : null,
        googleKey: settings.googleKey ? '••••' + settings.googleKey.slice(-4) : null,
        ollamaUrl: settings.ollamaUrl || null,
        defaultModel: settings.defaultModel || null,
      }
    : {
        openaiKey: null,
        anthropicKey: null,
        googleKey: null,
        ollamaUrl: null,
        defaultModel: null,
      };

  return success(redacted);
}

export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = UpdateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return error('VALIDATION_ERROR', 'Invalid input', 400, parsed.error.flatten());
  }

  const updates: Record<string, string | null> = {};
  if (parsed.data.openaiKey !== undefined) updates.openaiKey = parsed.data.openaiKey || null;
  if (parsed.data.anthropicKey !== undefined) updates.anthropicKey = parsed.data.anthropicKey || null;
  if (parsed.data.googleKey !== undefined) updates.googleKey = parsed.data.googleKey || null;
  if (parsed.data.ollamaUrl !== undefined) updates.ollamaUrl = parsed.data.ollamaUrl || null;
  if (parsed.data.defaultModel !== undefined) updates.defaultModel = parsed.data.defaultModel || null;

  const settings = await prisma.userSettings.upsert({
    where: { userId: user.userId },
    update: updates,
    create: {
      userId: user.userId,
      ...updates,
    },
  });

  return success({
    openaiKey: settings.openaiKey ? '••••' + settings.openaiKey.slice(-4) : null,
    anthropicKey: settings.anthropicKey ? '••••' + settings.anthropicKey.slice(-4) : null,
    googleKey: settings.googleKey ? '••••' + settings.googleKey.slice(-4) : null,
    ollamaUrl: settings.ollamaUrl || null,
    defaultModel: settings.defaultModel || null,
  });
}
