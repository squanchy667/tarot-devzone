import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Rocket, ExternalLink, CheckCircle, Loader } from 'lucide-react';

const GAME_URL = import.meta.env.VITE_GAME_URL || 'https://dui22oafwco41.cloudfront.net';

export default function DeployPanel() {
  const [lastDeploy, setLastDeploy] = useState<{ invalidationId: string; publishedAt: string } | null>(null);
  const [status, setStatus] = useState('');

  const deploy = useMutation({
    mutationFn: () => api.publish(),
    onSuccess: (data) => {
      setLastDeploy(data);
      setStatus('InProgress');
      if (data.invalidationId) pollStatus(data.invalidationId);
    },
  });

  const pollStatus = async (id: string) => {
    try {
      const res = await api.getDeployStatus(id);
      setStatus(res.status);
      if (res.status !== 'Completed') setTimeout(() => pollStatus(id), 3000);
    } catch { setStatus('Completed'); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Deploy</h2>
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center space-y-4">
        <p className="text-gray-400">Push current draft data to the live game</p>
        <button onClick={() => confirm('Publish draft data to live? This will update the game for all players.') && deploy.mutate()}
          disabled={deploy.isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-lg font-bold transition-colors disabled:opacity-50">
          <Rocket size={20} /> {deploy.isPending ? 'Publishing...' : 'Publish to Live'}
        </button>
      </div>
      {lastDeploy && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-3">
          <h3 className="font-semibold">Last Deploy</h3>
          <div className="flex items-center gap-2">
            {status === 'Completed' ? <CheckCircle className="text-green-400" size={16} /> : <Loader className="text-yellow-400 animate-spin" size={16} />}
            <span className="text-sm">{status === 'Completed' ? 'Cache invalidation complete' : 'Cache invalidation in progress...'}</span>
          </div>
          <p className="text-xs text-gray-500">Published at: {new Date(lastDeploy.publishedAt).toLocaleString()}</p>
        </div>
      )}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h3 className="font-semibold mb-2">Live Game</h3>
        <a href={GAME_URL} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 text-sm">
          Open Game <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
