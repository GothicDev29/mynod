'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PublicPoll {
  id: string;
  question: string;
  creatorId: string;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [publicPolls, setPublicPolls] = useState<PublicPoll[]>([]);
  const [privateId, setPrivateId] = useState('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) router.push('/');
        else setName(data.name);
      });

    fetch('/api/polls')
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch polls')))
      .then(setPublicPolls)
      .catch(() => {
        // Silencioso - mantiene array vacío
      });
  }, [router]);

  function handlePrivateEnter() {
    const uuid = privateId.trim();
    if (uuid) router.push(`/poll/${uuid}`);
  }

  return (
    <main className="min-h-screen bg-[#0f1117] px-4 py-12">
      <div className="max-w-lg mx-auto flex flex-col gap-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">MyNod</h1>
            {name && (
              <p className="text-gray-500 text-sm mt-1">
                Hola, <span className="text-gray-300">{name}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/dashboard/create-poll')}
            className="rounded-lg px-4 py-2 bg-[#4f8ef7] text-white text-sm font-semibold hover:bg-[#3a7de0] transition-colors"
          >
            Crear Encuesta
          </button>
        </div>

        {/* Encuestas públicas */}
        <section className="flex flex-col gap-3">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest">
            Encuestas Públicas
          </h2>
          {publicPolls.length === 0 ? (
            <p className="text-gray-600 text-sm">No hay encuestas públicas aún.</p>
          ) : (
            publicPolls.map((poll) => (
              <div
                key={poll.id}
                className="flex items-center justify-between gap-4 rounded-lg bg-[#1c1f26] px-4 py-3"
              >
                <span className="text-white text-sm truncate">{poll.question}</span>
                <button
                  onClick={() => router.push(`/poll/${poll.id}`)}
                  className="shrink-0 rounded-md px-3 py-1.5 bg-[#4f8ef7] text-white text-xs font-semibold hover:bg-[#3a7de0] transition-colors"
                >
                  Entrar
                </button>
              </div>
            ))
          )}
        </section>

        {/* Entrar a encuesta privada */}
        <section className="flex flex-col gap-3">
          <h2 className="text-gray-400 text-xs uppercase tracking-widest">
            Entrar a Encuesta Privada
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="UUID del poll"
              value={privateId}
              onChange={(e) => setPrivateId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePrivateEnter()}
              className="flex-1 rounded-lg px-4 py-3 bg-[#1c1f26] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#4f8ef7] text-sm"
            />
            <button
              onClick={handlePrivateEnter}
              className="rounded-lg px-4 py-3 bg-[#4f8ef7] text-white text-sm font-semibold hover:bg-[#3a7de0] transition-colors"
            >
              Entrar
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}
