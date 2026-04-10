'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VoteOption {
  id: string;
  text: string;
}

interface PollVoterProps {
  pollId: string;
  options: VoteOption[];
  isExpired: boolean;
}

export default function PollVoter({
  pollId,
  options,
  isExpired,
}: PollVoterProps) {
  const router = useRouter();

  const [selected, setSelected] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVote() {
    if (!selected || isLoading || hasVoted || isExpired) return;

    setIsLoading(true);
    setError(null);

    try {
      // Paso 1: obtener sessionToken
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        setError('Error de sesión. Recarga la página.');
        setIsLoading(false);
        return;
      }

      const sessionData = await sessionRes.json();
      const sessionToken = sessionData.token;

      // Paso 2: votar
      const voteRes = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: selected, sessionToken }),
      });

      if (voteRes.status === 201) {
        // Voto exitoso
        setHasVoted(true);
        setConfirmed(true);
        setTimeout(() => setConfirmed(false), 3000);
      } else if (voteRes.status === 400) {
        const data = await voteRes.json();
        if (data.error === 'Ya votaste en esta encuesta') {
          // Usuario ya votó - no mostrar error, solo deshabilitar
          setHasVoted(true);
        } else {
          setError(data.error ?? 'Error al votar');
        }
      } else if (voteRes.status === 403) {
        // Sin acceso a poll privado
        router.push(`/poll/${pollId}/access`);
      } else {
        setError('Error al registrar el voto. Intenta de nuevo.');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Grid de opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              if (!hasVoted && !isExpired) setSelected(option.id);
            }}
            disabled={hasVoted || isExpired || isLoading}
            className={`
              rounded-lg px-4 py-3 text-left w-full transition-all
              font-medium text-[#f1f1ef]
              bg-[#161b27] border
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                selected === option.id
                  ? 'border-[#4f8ef7] shadow-[0_0_0_1px_#4f8ef7]'
                  : 'border-[#232b3e]'
              }
              ${!hasVoted && !isExpired ? 'hover:border-[#4f8ef7]/50 cursor-pointer' : ''}
            `}
          >
            {option.text}
          </button>
        ))}
      </div>

      {/* Botón Votar */}
      <button
        onClick={handleVote}
        disabled={!selected || isLoading || hasVoted || isExpired}
        className={`
          w-full rounded-lg px-4 py-3 font-semibold transition-all
          ${
            !selected || isLoading || hasVoted || isExpired
              ? 'bg-[#4f8ef7]/50 text-[#f1f1ef] cursor-not-allowed'
              : 'bg-[#4f8ef7] text-white hover:bg-[#3a7de0]'
          }
        `}
      >
        {isLoading ? 'Votando...' : 'Votar'}
      </button>

      {/* Mensajes de estado */}
      {isExpired && !hasVoted && (
        <p className="text-center text-[#7a8499] text-sm">
          Este poll ha cerrado
        </p>
      )}

      {confirmed && (
        <p className="text-center text-[#4f8ef7] text-sm font-medium">
          ✓ Voto registrado
        </p>
      )}

      {error && (
        <p className="text-center text-red-400 text-sm">
          {error}
        </p>
      )}

      {hasVoted && !confirmed && !error && (
        <p className="text-center text-[#7a8499] text-sm">
          Ya votaste en esta encuesta
        </p>
      )}
    </section>
  );
}
