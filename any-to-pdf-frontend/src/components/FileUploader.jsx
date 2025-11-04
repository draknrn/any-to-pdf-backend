import React, { useRef } from 'react';

export default function FileUploader({ onFilesSelected }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    onFilesSelected(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/60 transition p-6 bg-white/5"
    >
      <div className="flex flex-col items-center gap-2">
        <p className="text-gray-300 text-sm">Drag & drop files here</p>
        <button
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 rounded-xl bg-primary/90 hover:bg-primary transition"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => onFilesSelected(Array.from(e.target.files))}
        />
      </div>
    </div>
  );
}
