import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const isDev = process.env.NODE_ENV === 'development';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'),
  trustHost: true,
  trustedOrigins: ['https://skillspace-registry.vercel.app', 'http://localhost:3000'],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  advanced: {
    useSecureCookies: !isDev,
    defaultCookieAttributes: {
      sameSite: isDev ? "lax" : "none",
      secure: !isDev,
    }
  },
  plugins: [
    twoFactor({
      issuer: "SkillSpace Registry",
    }),
  ]
});

/**
 * Extract authenticated user from a request.
 * Supports both BetterAuth session cookies (browser) and Bearer tokens (CLI).
 */
export async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; username: string; email: string } | null> {
  // 1. Try Bearer token (CLI flow)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const session = await prisma.session.findUnique({
        where: { token },
        include: { user: true },
      });
      if (session && session.expiresAt > new Date()) {
        return {
          userId: session.user.id,
          username: session.user.name || session.user.email.split("@")[0],
          email: session.user.email,
        };
      }
    } catch {
      // Fall through to session cookie method
    }
  }

  // 2. Try BetterAuth session cookie (browser flow)
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user) return null;
    return {
      userId: session.user.id,
      username: session.user.name || session.user.email.split("@")[0],
      email: session.user.email,
    };
  } catch {
    return null;
  }
}
