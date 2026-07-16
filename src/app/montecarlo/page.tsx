import MonteCarloSimulator from "@/components/MonteCarloSimulator";

export default function MonteCarloPage() {
  return (
    <div className="mx-auto w-full max-w-[920px] space-y-6 p-4 pb-24 md:p-6">
      <div className="space-y-3">
        <div className="flex items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
          <span>distrosolve</span>
          <span className="mx-2 text-zinc-800">/</span>
          <span className="text-zinc-300">montecarlo</span>
        </div>
        <div>
          <h1 className="font-mono text-2xl font-medium tracking-tight text-white">
            Simulación de Montecarlo
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-zinc-400">
            Genere bases de datos aleatorias y compare sus resultados con el modelo teórico.
          </p>
        </div>
      </div>

      <MonteCarloSimulator />
    </div>
  );
}
