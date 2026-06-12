export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProfileClient from './ProfileClient';


export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // Since we are mocking/using demo data in many places, if a user doesn't exist, we will mock them
  // so the open source community showcase works smoothly without forcing DB seeds.
  let user = await prisma.user.findUnique({
    where: { username },
    include: {
      packages: {
        include: {
          _count: { select: { stars: true } }
        }
      },
      _count: {
        select: {
          followers: true,
          following: true,
          packages: true,
        }
      }
    }
  });

  const safeUser = user || {
    username: username,
    bio: 'Open source contributor and AI researcher.',
    avatar: null,
    banner: null,
    github: `https://github.com/${username}`,
    website: `https://${username}.com`,
    twitter: `https://twitter.com/${username}`,
    createdAt: new Date(),
    packages: [
      { id: '1', name: `@${username}/demo-skill`, description: 'A powerful AI skill for demonstration purposes.', _count: { stars: 42 } }
    ],
    _count: {
      followers: 125,
      following: 12,
      packages: 1
    }
  };

  const profileData = {
    username: safeUser.username || username,
    bio: safeUser.bio,
    avatar: 'image' in safeUser ? safeUser.image : (safeUser as any).avatar,
    banner: safeUser.banner,
    github: safeUser.github,
    website: safeUser.website,
    twitter: safeUser.twitter,
    createdAt: safeUser.createdAt,
    stats: {
      followers: safeUser._count.followers,
      following: safeUser._count.following,
      packages: safeUser._count.packages,
    },
    packages: safeUser.packages,
  };

  return <ProfileClient profile={profileData} />;
}
