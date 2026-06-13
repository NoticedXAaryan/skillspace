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

  if (!user) notFound();

  const profileData = {
    username: user.username || username,
    bio: user.bio,
    avatar: 'image' in user ? user.image : (user as any).avatar,
    banner: user.banner,
    github: user.github,
    website: user.website,
    twitter: user.twitter,
    createdAt: user.createdAt,
    stats: {
      followers: user._count.followers,
      following: user._count.following,
      packages: user._count.packages,
    },
    packages: user.packages,
  };

  return <ProfileClient profile={profileData} />;
}
