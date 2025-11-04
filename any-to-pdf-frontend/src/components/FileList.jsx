import React from 'react';

export default function FileList({ files }) {
  if (!files.length) return null;
  return (
    <ul className="mt-4 space-y-2">
      {files.map((f, i) => (
        <li
          key={i}
          className="flex items-center justify-between text-sm bg-white/5 px-3 py-2 rounded-lg border border-white/10 hover:border-primary/40 transition"
        >
          <span className="truncate">{i + 1}. {f.name}</span>
          <span className="ml-3 text-gray-400">{(f.size / 1024).toFixed(1)} KB</span>
        </li>
      ))}
    </ul>
  );
}
