'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PollAccess() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/polls/${id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(`/poll/${id}`);
      } else if (res.status === 401) {
        setError('Contraseña incorrecta');
      } else {
        const data = await res.json();
        setError(data.error ?? 'Error al verificar');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f1117]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm px-6">
        <h1 className="text-white text-2xl font-bold text-center">
          Acceso a encuesta privada
        </h1>
        <p className="text-gray-400 text-sm text-center">
          Esta encuesta está protegida con contraseña
        </p>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg px-4 py-3 bg-[#1c1f26] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#4f8ef7]"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg px-4 py-3 bg-[#4f8ef7] text-white font-semibold hover:bg-[#3a7de0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : 'Acceder'}
        </button>
      </form>
    </main>
  );
}
