'use client';

import { useState, useEffect } from 'react';

interface ResultOption {
  id: string;
  text: string;
  votes: number;
}

interface PollResultsProps {
  pollId: string;
  initialOptions: ResultOption[];
  initialTotal: number;
}

export default function PollResults({
  pollId,
  initialOptions,
  initialTotal,
}: PollResultsProps) {
  const [options, setOptions] = useState<ResultOption[]>(initialOptions);
  const [totalVotes, setTotalVotes] = useState(initialTotal);

  useEffect(() => {
    const fetchUpdatedPoll = async () => {
      try {
        const res = await fetch(`/api/polls/${pollId}`);
        if (!res.ok) return; // fallo silencioso
        const data = await res.json();
        setOptions(data.options);
        setTotalVotes(data.totalVotes);
      } catch {
        // fallo silencioso - no romper la UI
      }
    };

    const interval = setInterval(fetchUpdatedPoll, 3000);
    return () => clearInterval(interval);
  }, [pollId]);

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[#7a8499] text-xs uppercase tracking-widest font-medium">
        Resultados en vivo
      </h2>

      <div className="flex flex-col gap-4">
        {options.map((option) => {
          const pct =
            totalVotes > 0
              ? Math.round((option.votes / totalVotes) * 100)
              : 0;

          return (
            <div key={option.id} className="flex flex-col gap-1">
              <span className="text-[#f1f1ef] text-sm font-medium">
                {option.text}
              </span>

              {/* Barra de progreso */}
              <div className="w-full bg-[#232b3e] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#4f8ef7] h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Estadísticas */}
              <span className="font-mono text-[#7a8499] text-xs">
                {option.votes} votos · {pct}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Total de votos */}
      <div className="pt-4 border-t border-[#232b3e]">
        <p className="text-[#7a8499] text-xs">
          Total de votos:{' '}
          <span className="font-mono text-[#f1f1ef]">{totalVotes}</span>
        </p>
      </div>
    </section>
  );
}
