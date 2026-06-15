'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Save, AlertTriangle, Code2 } from 'lucide-react';
import { toast } from 'sonner';

interface YamlEditorProps {
  initialCode: string;
  packageName: string;
}

export default function YamlEditor({ initialCode, packageName }: YamlEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    // Simulate save draft
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success('Draft saved successfully');
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch(`/api/packages/${packageName}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yamlContent: code }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success('Package published successfully!');
    } catch (error: any) {
      toast.error(`Publish failed: ${error.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] border border-white/10 rounded-xl overflow-hidden bg-neutral-900">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm text-neutral-300 font-mono">
          <Code2 className="w-4 h-4 text-cyan-400" />
          skill.yaml
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] ml-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Unsaved changes
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {isPublishing ? 'Publishing...' : 'Publish to Registry'}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'var(--font-mono)',
            padding: { top: 16 },
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
