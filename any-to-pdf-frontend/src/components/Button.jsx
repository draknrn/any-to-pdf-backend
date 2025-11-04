import React from 'react';

export default function Button({ children, onClick, loading, variant='primary' }) {
  const base = 'px-4 py-2 rounded-xl transition shadow-soft disabled:opacity-60 disabled:cursor-not-allowed';
  const style = variant === 'accent'
    ? 'bg-accent hover:opacity-90'
    : 'bg-primary hover:opacity-90';

  return (
    <button onClick={onClick} disabled={loading} className={`${base} ${style}`}>
      {loading ? 'Processing…' : children}
    </button>
  );
}
