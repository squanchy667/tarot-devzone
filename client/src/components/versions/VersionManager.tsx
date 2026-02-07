import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useState } from 'react';
import { Plus, Upload, RotateCcw, Check } from 'lucide-react';

export default function VersionManager() {
  const qc = useQueryClient();
  const { data: versions, isLoading } = useQuery({ queryKey: ['versions'], queryFn: api.getVersions });
  const create = useMutation({ mutationFn: (desc: string) => api.createVersion(desc), onSuccess: () => qc.invalidateQueries({ queryKey: ['versions'] }) });
  const publish = useMutation({ mutationFn: (id: string) => api.publishVersion(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['versions'] }) });
  const rollback = useMutation({ mutationFn: (id: string) => api.rollbackVersion(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['versions'] }) });
  const [desc, setDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <div className="text-gray-400">Loading versions...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Version Manager</h2>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 rounded text-sm font-medium transition-colors">
          <Plus size={14} /> Create Version
        </button>
      </div>
      {showCreate && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Version description..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white" />
          <div className="flex gap-2">
            <button onClick={async () => { await create.mutateAsync(desc); setDesc(''); setShowCreate(false); }} disabled={create.isPending}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 rounded text-sm font-medium transition-colors disabled:opacity-50">
              {create.isPending ? 'Creating...' : 'Create'}</button>
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 bg-gray-800 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {(versions || []).map((v: any) => (
          <div key={v.versionId} className={`bg-gray-900 rounded-xl border p-4 flex items-center gap-4 ${v.isLive ? 'border-green-600/50' : 'border-gray-800'}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{v.versionId}</span>
                {v.isLive && <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full"><Check size={12} /> LIVE</span>}
              </div>
              <p className="text-sm text-gray-400">{v.description}</p>
              <p className="text-xs text-gray-600">{v.author} - {new Date(v.timestamp).toLocaleString()}</p>
            </div>
            {!v.isLive && (
              <div className="flex gap-2">
                <button onClick={() => confirm('Publish this version?') && publish.mutate(v.versionId)}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded text-xs transition-colors">
                  <Upload size={12} /> Publish</button>
                <button onClick={() => confirm('Rollback to this version?') && rollback.mutate(v.versionId)}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors">
                  <RotateCcw size={12} /> Rollback</button>
              </div>
            )}
          </div>
        ))}
        {(!versions || versions.length === 0) && <p className="text-gray-500">No versions yet. Create your first version snapshot.</p>}
      </div>
    </div>
  );
}
