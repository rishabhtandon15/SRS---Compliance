import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { clsx } from 'clsx'
import { Upload, X, FileText } from 'lucide-react'

interface Props {
  label: string
  hint?: string
  accept?: Record<string, string[]>
  onChange: (file: File | null) => void
  value: File | null
}

export default function FileDropzone({ label, hint, accept, onChange, value }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onChange(accepted[0])
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-indigo-900/30 border border-indigo-700 rounded-xl">
          <FileText size={18} className="text-indigo-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{value.name}</p>
            <p className="text-xs text-slate-500">{(value.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={clsx(
            'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
            isDragActive
              ? 'border-indigo-500 bg-indigo-900/20'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/30'
          )}
        >
          <input {...getInputProps()} />
          <Upload size={24} className="mx-auto mb-2 text-slate-500" />
          <p className="text-sm text-slate-400">
            {isDragActive ? 'Drop file here…' : 'Drag & drop or click to select'}
          </p>
          {hint && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
        </div>
      )}
    </div>
  )
}
