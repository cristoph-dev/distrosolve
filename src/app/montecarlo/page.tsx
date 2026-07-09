import { Binary, Construction } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
            Módulo reservado para simulación probabilística por muestreo.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border-zinc-800 bg-zinc-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-mono text-sm font-normal">
            <Binary className="h-4 w-4 text-zinc-500" />
            Módulo bajo construcción
          </CardTitle>
          <CardDescription className="card-description-copy">
            La herramienta de Montecarlo está en preparación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-none border border-zinc-800 bg-zinc-950 p-6 text-center">
            <Construction className="h-7 w-7 text-zinc-500" />
            <p className="max-w-md text-[13px] leading-5 text-zinc-500">
              Próximamente se habilitarán controles de simulación, resultados muestrales e histogramas comparativos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
