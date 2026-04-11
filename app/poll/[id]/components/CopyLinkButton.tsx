'use client';

import { useState } from 'react';

interface CopyLinkButtonProps {
  pollId: string;
}

export default function CopyLinkButton({ pollId }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/poll/${pollId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1c1f26] transition-colors"
      title={copied ? '¡Copiado!' : 'Copiar link de encuesta'}
    >
      {copied ? (
        <>
          <span>✓</span>
          <span>Copiado</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>Copiar link</span>
        </>
      )}
    </button>
  );
}
