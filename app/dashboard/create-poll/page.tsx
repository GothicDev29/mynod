'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

async function getToken(): Promise<string | null> {
  const res = await fetch('/api/auth/session');
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}

export default function CreatePoll() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [createdPollId, setCreatedPollId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getToken().then((t) => {
      if (!t) router.push('/');
      else setToken(t);
    });
  }, [router]);

  const addOption = useCallback(() => {
    setOptions((prev) => [...prev, '']);
  }, []);

  const removeOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateOption = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }, []);

  const handleCopyLink = async () => {
    if (!createdPollId) return;
    const url = `${window.location.origin}/poll/${createdPollId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleGoToPoll = () => {
    if (!createdPollId) return;
    router.push(`/poll/${createdPollId}`);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!question.trim()) {
      setError('La pregunta no puede estar vacía');
      return;
    }
    const filledOptions = options.map((o) => o.trim()).filter(Boolean);
    if (filledOptions.length < 2) {
      setError('Debes agregar al menos 2 opciones');
      return;
    }
    if (!isPublic && !password.trim()) {
      setError('Debes ingresar una contraseña para la sala privada');
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        question: question.trim(),
        options: filledOptions,
        isPublic,
      };
      if (!isPublic) body.password = password.trim();

      const res = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 201) {
        const data = await res.json();
        setCreatedPollId(data.id);
      } else {
        const data = await res.json();
        setError(data.error ?? 'Error al crear la encuesta');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // Pantalla de confirmación si la encuesta fue creada
  if (createdPollId) {
    const pollUrl = `${window.location.origin}/poll/${createdPollId}`;
    return (
      <main className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="w-full max-w-lg flex flex-col gap-6 text-center">
          <div className="text-5xl">✨</div>
          <h1 className="text-white text-2xl font-bold">¡Encuesta creada!</h1>

          <p className="text-gray-400 text-sm">
            Comparte este link con otros para que puedan participar:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={pollUrl}
              readOnly
              className="flex-1 rounded-lg px-4 py-3 bg-[#1c1f26] text-gray-300 text-sm font-mono outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-3 rounded-lg bg-[#4f8ef7] text-white font-semibold hover:bg-[#3a7de0] transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <button
            onClick={handleGoToPoll}
            className="rounded-lg px-4 py-3 bg-[#4f8ef7] text-white font-semibold hover:bg-[#3a7de0] transition-colors"
          >
            Ir a la encuesta
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1117] flex items-start justify-center pt-16 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg flex flex-col gap-6"
      >
        <h1 className="text-white text-2xl font-bold">Nueva encuesta</h1>

        {/* Pregunta */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm">Pregunta</label>
          <input
            type="text"
            placeholder="¿Cuál es tu pregunta?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="rounded-lg px-4 py-3 bg-[#1c1f26] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#4f8ef7]"
          />
        </div>

        {/* Opciones */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm">Opciones</label>
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder={`Opción ${i + 1}`}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1 rounded-lg px-4 py-3 bg-[#1c1f26] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#4f8ef7]"
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="px-3 py-2 rounded-lg bg-[#2a2d35] text-gray-400 hover:text-red-400 hover:bg-[#1c1f26] transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="self-start text-sm text-[#4f8ef7] hover:underline mt-1"
          >
            + Agregar opción
          </button>
        </div>

        {/* Toggle público / privado */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-400 text-sm">Visibilidad</label>
          <div className="flex rounded-lg overflow-hidden bg-[#1c1f26] w-fit">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                isPublic
                  ? 'bg-[#4f8ef7] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Público
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`px-5 py-2 text-sm font-medium transition-colors ${
                !isPublic
                  ? 'bg-[#4f8ef7] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Privado
            </button>
          </div>
        </div>

        {/* Contraseña (solo si privado) */}
        {!isPublic && (
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm">Contraseña de sala</label>
            <input
              type="password"
              placeholder="Contraseña para acceder"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg px-4 py-3 bg-[#1c1f26] text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#4f8ef7]"
            />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !token}
          className="rounded-lg px-4 py-3 bg-[#4f8ef7] text-white font-semibold hover:bg-[#3a7de0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando...' : 'Crear Encuesta'}
        </button>
      </form>
    </main>
  );
}
