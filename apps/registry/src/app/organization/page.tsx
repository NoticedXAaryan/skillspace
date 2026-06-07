'use client';

import React, { useState } from 'react';
import { Users, Shield, Plus, Settings, Trash2 } from 'lucide-react';

export default function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState('members');

  // Stub data for MVP
  const orgName = "Acme Corp";
  const members = [
    { id: '1', name: 'Alice Admin', role: 'admin', email: 'alice@acme.com' },
    { id: '2', name: 'Bob Engineer', role: 'member', email: 'bob@acme.com' },
  ];
  
  const allowlist = [
    { id: '1', package: 'sql-optimizer', addedBy: 'Alice Admin', date: '2026-06-05' },
    { id: '2', package: 'react-component-gen', addedBy: 'Alice Admin', date: '2026-06-06' },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
            {orgName} Organization
          </h2>
          <p className="mt-1 flex items-center text-sm text-slate-400">
            Manage your organization's members, roles, and allowed skills.
          </p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Users className="inline-block w-4 h-4 mr-2" />
          Members
        </button>
        <button
          onClick={() => setActiveTab('allowlist')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'allowlist'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Shield className="inline-block w-4 h-4 mr-2" />
          Package Allowlist
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
          }`}
        >
          <Settings className="inline-block w-4 h-4 mr-2" />
          Settings
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl overflow-hidden">
        {activeTab === 'members' && (
          <div>
            <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center">
              <h3 className="text-base font-semibold leading-6 text-white">Organization Members</h3>
              <button className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-400 shadow-sm hover:bg-blue-500/20">
                <Plus className="-ml-0.5 h-4 w-4" />
                Invite Member
              </button>
            </div>
            <ul role="list" className="divide-y divide-slate-700/50">
              {members.map((person) => (
                <li key={person.id} className="flex justify-between gap-x-6 py-5 px-6 hover:bg-slate-800/80 transition-colors">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="h-10 w-10 flex-none rounded-full bg-slate-700 flex items-center justify-center text-lg font-medium text-white">
                      {person.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-white">{person.name}</p>
                      <p className="mt-1 truncate text-xs leading-5 text-slate-400">{person.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      person.role === 'admin' 
                        ? 'bg-purple-400/10 text-purple-400 ring-purple-400/30' 
                        : 'bg-slate-400/10 text-slate-400 ring-slate-400/30'
                    }`}>
                      {person.role}
                    </span>
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'allowlist' && (
          <div>
            <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h3 className="text-base font-semibold leading-6 text-white">Approved Packages</h3>
                <p className="text-sm text-slate-400 mt-1">Skills that members of this organization are permitted to execute.</p>
              </div>
              <button className="inline-flex items-center gap-x-1.5 rounded-md bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-400 shadow-sm hover:bg-green-500/20">
                <Plus className="-ml-0.5 h-4 w-4" />
                Add Package
              </button>
            </div>
            <ul role="list" className="divide-y divide-slate-700/50">
              {allowlist.map((item) => (
                <li key={item.id} className="flex justify-between gap-x-6 py-5 px-6 hover:bg-slate-800/80 transition-colors">
                  <div className="flex min-w-0 gap-x-4 items-center">
                    <Shield className="h-5 w-5 text-green-400" />
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-white">{item.package}</p>
                      <p className="mt-1 truncate text-xs leading-5 text-slate-400">Added by {item.addedBy} on {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <button className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="px-6 py-5">
            <h3 className="text-base font-semibold leading-6 text-white mb-4">Organization Policies</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Enforce Strict Allowlist</h4>
                  <p className="text-xs text-slate-400">If enabled, members can ONLY execute packages in the allowlist.</p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-500 transition-colors duration-200 ease-in-out focus:outline-none">
                  <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Require MFA</h4>
                  <p className="text-xs text-slate-400">Require all members to enable Multi-Factor Authentication.</p>
                </div>
                <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-600 transition-colors duration-200 ease-in-out focus:outline-none">
                  <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
