'use client';

import { useState } from 'react';
import { Globe, MapPin, Package, Star, Users, Folder, Code2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileData {
  username: string;
  bio: string | null;
  avatar: string | null;
  banner: string | null;
  github: string | null;
  website: string | null;
  twitter: string | null;
  createdAt: Date;
  stats: {
    followers: number;
    following: number;
    packages: number;
  };
  packages: any[];
}

export default function ProfileClient({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<'skills' | 'collections' | 'followers' | 'achievements'>('skills');

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Banner & Avatar */}
      <div className="relative">
        <div 
          className="h-48 md:h-64 bg-neutral-900 w-full relative overflow-hidden" 
          style={profile.banner ? { backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {!profile.banner && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(34,211,238,0.15),transparent_70%)]" />}
        </div>
        
        <div className="container mx-auto px-6 max-w-5xl relative">
          <div className="absolute -top-16 left-6 md:left-10">
            <div className="w-32 h-32 rounded-full border-4 border-black bg-neutral-900 overflow-hidden flex items-center justify-center text-4xl font-bold text-white relative">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center text-cyan-400">
                  {profile.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-6 max-w-5xl mt-20 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">@{profile.username}</h1>
          <p className="text-neutral-400 max-w-xl leading-relaxed">{profile.bio || 'This user has no bio yet.'}</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {profile.github && (
              <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-cyan-400 transition-colors">
                <Code2 className="w-4 h-4" /> GitHub
              </a>
            )}
            {profile.twitter && (
              <a href={profile.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-cyan-400 transition-colors">
                <MessageCircle className="w-4 h-4" /> Twitter
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-cyan-400 transition-colors">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        </div>

        <Button className="bg-white text-black hover:bg-neutral-200 font-bold px-8">Follow</Button>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-center gap-6 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
          <button 
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'skills' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-neutral-400 hover:text-white'}`}
            onClick={() => setActiveTab('skills')}
          >
            <Package className="w-4 h-4" />
            Skills <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-xs ml-1">{profile.stats.packages}</span>
          </button>
          <button 
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'collections' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-neutral-400 hover:text-white'}`}
            onClick={() => setActiveTab('collections')}
          >
            <Folder className="w-4 h-4" />
            Collections
          </button>
          <button 
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'followers' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-neutral-400 hover:text-white'}`}
            onClick={() => setActiveTab('followers')}
          >
            <Users className="w-4 h-4" />
            Followers <span className="bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded text-xs ml-1">{profile.stats.followers}</span>
          </button>
          <button 
            className={`flex items-center gap-2 pb-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'achievements' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-neutral-400 hover:text-white'}`}
            onClick={() => setActiveTab('achievements')}
          >
            <Star className="w-4 h-4" />
            Achievements
          </button>
        </div>

        <div>
          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.packages.length > 0 ? (
                profile.packages.map(pkg => (
                  <Link href={`/packages/${pkg.name}`} key={pkg.id} className="block">
                    <Card className="bg-neutral-950 border-white/10 hover:border-cyan-500/30 transition-colors h-full">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">{pkg.name}</h3>
                        <p className="text-sm text-neutral-400 mb-4 line-clamp-2">{pkg.description}</p>
                        <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono">
                          <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> {pkg._count?.stars || 0}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl bg-neutral-950/50">
                  No skills published yet.
                </div>
              )}
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="py-20 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl bg-neutral-950/50">No collections created yet.</div>
          )}

          {activeTab === 'followers' && (
            <div className="py-20 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl bg-neutral-950/50">No followers yet.</div>
          )}
          
          {activeTab === 'achievements' && (
            <div className="py-20 text-center text-neutral-500 border border-dashed border-white/10 rounded-xl bg-neutral-950/50">No achievements yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
