import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://skillspace-registry.vercel.app'),
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
    useSecureCookies: false,
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true
    }
  },
  plugins: [
    twoFactor({
      issuer: "SkillSpace Registry",
    }),
  ]
});

export async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; username: string; email: string } | null> {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    if (!session?.user) return null;
    return {
      userId: session.user.id,
      username: session.user.name || session.user.email.split('@')[0],
      email: session.user.email,
    };
  } catch {
    return null;
  }
}
