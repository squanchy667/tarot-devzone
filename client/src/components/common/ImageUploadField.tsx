import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader } from 'lucide-react';
import { api } from '../../services/api';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  maxSizeMB?: number;
}

export default function ImageUploadField({ value, onChange, label, folder, maxSizeMB = 5 }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { url } = await api.uploadImage(file, undefined, folder);
      onChange(url);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onChange, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'] },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
    onDropRejected: (rejections) => {
      const msg = rejections[0]?.errors[0]?.message || 'File rejected';
      setError(msg);
    },
  });

  return (
    <div>
      {label && <label className="block text-sm text-gray-400 mb-1">{label}</label>}
      {value ? (
        <div className="relative group">
          <img src={value} alt="Preview" className="w-full h-32 object-contain bg-gray-800 rounded border border-gray-700" />
          <button type="button" onClick={() => onChange('')}
            className="absolute top-1 right-1 p-1 bg-gray-900/80 rounded hover:bg-red-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div {...getRootProps()}
          className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded cursor-pointer transition-colors
            ${isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'}`}>
          <input {...getInputProps()} />
          {uploading ? (
            <Loader size={20} className="text-brand-400 animate-spin" />
          ) : (
            <>
              <Upload size={20} className="text-gray-500 mb-1" />
              <span className="text-xs text-gray-500">{isDragActive ? 'Drop image here' : 'Drag & drop or click'}</span>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Or paste image URL"
        className="w-full mt-1.5 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:border-brand-500"
      />
    </div>
  );
}
