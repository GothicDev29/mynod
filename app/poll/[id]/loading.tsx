export default function PollLoading() {
  return (
    <main className="min-h-screen bg-[#0f1117]">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        {/* Pregunta skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 md:h-14 bg-[#161b27] rounded-lg w-3/4" />
        </div>

        {/* Divisor */}
        <div className="h-px bg-[#232b3e] mb-8" />

        {/* Grid de contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Skeleton de votación */}
          <div className="lg:col-span-1 animate-pulse">
            {/* Opciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-[#161b27] border border-[#232b3e] rounded-lg"
                />
              ))}
            </div>

            {/* Botón */}
            <div className="h-11 bg-[#4f8ef7]/30 rounded-lg" />
          </div>

          {/* Divisor vertical */}
          <div className="hidden lg:block w-px bg-[#232b3e]" />

          {/* Skeleton de resultados */}
          <div className="lg:col-span-1 animate-pulse">
            <div className="h-4 bg-[#161b27] rounded w-1/3 mb-6" />

            {/* Barras de progreso */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-4">
                <div className="h-3 bg-[#161b27] rounded w-1/2 mb-2" />
                <div className="h-2.5 bg-[#232b3e] rounded-full mb-2" />
                <div className="h-3 bg-[#161b27] rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
