'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      setError('Error al registrar. Intenta de nuevo.');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm px-6">
        <h1 className="text-white text-2xl font-bold text-center">MyNod</h1>
        <input
          type="text"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg px-4 py-3 bg-[#1c1f26] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#4f8ef7]"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="rounded-lg px-4 py-3 bg-[#4f8ef7] text-white font-semibold hover:bg-[#3a7de0] transition-colors"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
