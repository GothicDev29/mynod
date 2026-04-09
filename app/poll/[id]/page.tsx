'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  isPublic: boolean;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
}

async function getSessionToken(): Promise<string | null> {
  const res = await fetch('/api/auth/session');
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}

export default function PollPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPoll = useCallback(async () => {
    const res = await fetch(`/api/polls/${id}`);
    if (res.status === 403) {
      router.push(`/poll/${id}/access`);
      return;
    }
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    if (res.ok) {
      const data: Poll = await res.json();
      setPoll(data);
    }
  }, [id, router]);

  // Carga inicial + obtener sessionToken
  useEffect(() => {
    fetchPoll();
    getSessionToken().then(setSessionToken);
  }, [fetchPoll]);

  // Polling cada 3 segundos si ya votó
  useEffect(() => {
    if (!hasVoted) return;
    intervalRef.current = setInterval(fetchPoll, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasVoted, fetchPoll]);

  async function handleVote(optionId: string) {
    if (!sessionToken || voting || hasVoted) return;
    setVoting(true);
    setVoteError('');

    const res = await fetch(`/api/polls/${id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optionId, sessionToken }),
    });

    if (res.status === 201) {
      const data = await res.json();
      setPoll((prev) => prev ? { ...prev, options: data.options, totalVotes: data.totalVotes } : prev);
      setHasVoted(true);
    } else if (res.status === 400) {
      const data = await res.json();
      if (data.error === 'Ya votaste en esta encuesta') {
        setHasVoted(true);
      } else {
        setVoteError(data.error ?? 'Error al votar');
      }
    } else if (res.status === 401) {
      router.push(`/poll/${id}/access`);
    } else {
      setVoteError('Error al registrar el voto');
    }

    setVoting(false);
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <p className="text-gray-400 text-lg">Poll no encontrado</p>
      </main>
    );
  }

  if (!poll) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0f1117]">
        <p className="text-gray-500 text-sm">Cargando...</p>
      </main>
    );
  }

  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 1);

  return (
    <main className="min-h-screen bg-[#0f1117] flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-lg flex flex-col gap-8">
        {/* Pregunta */}
        <div className="flex flex-col gap-2">
          <h1 className="text-white text-3xl font-bold leading-snug">
            {poll.question}
          </h1>
          <p className="text-gray-500 text-sm">{poll.totalVotes} votos totales</p>
        </div>

        {/* Opciones */}
        <div className="flex flex-col gap-3">
          {poll.options.map((option) => {
            const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={hasVoted || voting}
                className="relative w-full rounded-lg overflow-hidden text-left px-4 py-3 bg-[#1c1f26] hover:bg-[#252830] transition-colors disabled:cursor-default group"
              >
                {/* Barra de progreso de fondo */}
                <div
                  className="absolute inset-0 bg-[#4f8ef7]/20 transition-all duration-500"
                  style={{ width: hasVoted ? `${pct}%` : '0%' }}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <span className="text-white font-medium">{option.text}</span>
                  {hasVoted && (
                    <span className="text-gray-400 text-sm whitespace-nowrap">
                      {option.votes} ({pct}%)
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Estado */}
        {hasVoted && (
          <p className="text-[#4f8ef7] text-sm text-center">
            Ya votaste · actualizando cada 3 seg
          </p>
        )}
        {voteError && (
          <p className="text-red-400 text-sm text-center">{voteError}</p>
        )}
      </div>
    </main>
  );
}
