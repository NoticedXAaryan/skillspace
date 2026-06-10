import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
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
    useSecureCookies: false, // For local dev and CLI interaction
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true
    }
  },
  trustedOrigins: ['https://skillspace-registry.vercel.app', 'http://localhost:3000'],
  plugins: [
    twoFactor({
      issuer: "AIR Registry",
    }),
  ]
});
