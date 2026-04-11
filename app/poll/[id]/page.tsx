import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DM_Sans } from 'next/font/google';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { polls, options } from '@/lib/schema';
import PollVoter from './components/PollVoter';
import PollResults from './components/PollResults';
import CopyLinkButton from './components/CopyLinkButton';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
});

interface PollPageParams {
  id: string;
}

export default async function PollPage(props: {
  params: Promise<PollPageParams>;
}) {
  const { id } = await props.params;

  // 1. Obtener el poll de la base de datos
  const [poll] = await db.select().from(polls).where(eq(polls.id, id));

  if (!poll) {
    notFound();
  }

  // 2. Validar acceso si el poll es privado
  if (!poll.isPublic) {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('token')?.value;

    if (!sessionToken) {
      redirect(`/poll/${id}/access`);
    }

    const hasAccess = await redis.get(`pollAccess:${id}:${sessionToken}`);
    if (!hasAccess) {
      redirect(`/poll/${id}/access`);
    }
  }

  // 3. Obtener todas las opciones del poll
  const pollOptions = await db
    .select()
    .from(options)
    .where(eq(options.pollId, id));

  // 4. Obtener conteo de votos desde Redis para cada opción
  const optionsWithVotes = await Promise.all(
    pollOptions.map(async (option) => {
      const votesRaw = await redis.get(`votes:${id}:${option.id}`);
      return {
        id: option.id,
        text: option.text,
        votes: votesRaw ? parseInt(votesRaw, 10) : 0,
      };
    })
  );

  const totalVotes = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);

  // 5. Verificar si el poll ha expirado
  const isExpired = poll.expiresAt < new Date();

  return (
    <main className={`${dmSans.className} min-h-screen bg-[#0f1117]`}>
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Pregunta del poll */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-4xl font-semibold text-[#f1f1ef] leading-snug">
            {poll.question}
          </h1>

          <div className="shrink-0 flex items-center gap-2">
            <CopyLinkButton pollId={id} />

            {/* Badge "Poll cerrado" */}
            {isExpired && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#232b3e] text-[#7a8499]">
                Cerrado
              </span>
            )}
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-[#232b3e] mb-8" />

        {/* Grid 2 columnas en desktop: Votación + Resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: Votación */}
          <div className="lg:col-span-1">
            <PollVoter
              pollId={id}
              options={optionsWithVotes.map((o) => ({ id: o.id, text: o.text }))}
              isExpired={isExpired}
            />
          </div>

          {/* Divisor vertical sutil en desktop */}
          <div className="hidden lg:block w-px bg-[#232b3e]" />

          {/* Columna derecha: Resultados */}
          <div className="lg:col-span-1">
            <PollResults
              pollId={id}
              initialOptions={optionsWithVotes}
              initialTotal={totalVotes}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-12 pt-8 border-t border-[#232b3e]">
          <p className="text-[#7a8499] text-xs">
            Creado:{' '}
            <span className="font-mono">
              {new Date(poll.createdAt).toLocaleDateString('es-ES')}
            </span>
            {' '}·{' '}
            Expira:{' '}
            <span className="font-mono">
              {new Date(poll.expiresAt).toLocaleDateString('es-ES')}
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
