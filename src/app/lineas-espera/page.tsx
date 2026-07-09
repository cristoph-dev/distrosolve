"use client";

import { useEffect, useState } from "react";

import { MultipleServersQueueModule } from "./multiples-servidores/page";
import { SingleServerQueueModule } from "../lineas-espera-servidor/page";
import { cn } from "@/lib/utils";

type WaitingLineMode = "single" | "multiple";

export default function WaitingLinesPage() {
  const [mode, setMode] = useState<WaitingLineMode>("single");

  useEffect(() => {
    document.title = mode === "single"
      ? "Líneas de espera de un servidor | distrosolve"
      : "Líneas de espera de múltiples servidores | distrosolve";
  }, [mode]);

  return (
    <div className="mx-auto w-full max-w-[1120px] space-y-6 p-4 pb-24 md:p-6">
      <div className="space-y-3">
        <div className="flex items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
          <span>distrosolve</span>
          <span className="mx-2 text-zinc-800">/</span>
          <span className="text-zinc-300">líneas de espera</span>
        </div>
        <div>
          <h1 className="font-mono text-2xl font-medium tracking-tight text-white">
            {mode === "single"
              ? "Líneas de espera de un servidor"
              : "Líneas de espera de múltiples servidores"}
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-zinc-400">
            {mode === "single"
              ? "Calcula sistemas M/M/1 sin límite en cola y M/M/1/K con capacidad finita."
              : "Calcula sistemas M/M/s sin límite y M/M/s/K con capacidad finita."}
          </p>
        </div>
        <div className="relative flex h-10 w-full max-w-md overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <span
            className={cn(
              "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-zinc-800 transition-transform duration-300 ease-out",
              mode === "multiple" && "translate-x-full"
            )}
          />
          <button
            type="button"
            onClick={() => setMode("single")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-md px-3 text-center font-mono text-[11px] uppercase tracking-wider transition-colors hover:text-white",
              mode === "single" ? "text-white" : "text-zinc-500"
            )}
          >
            Un servidor
          </button>
          <button
            type="button"
            onClick={() => setMode("multiple")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-md px-3 text-center font-mono text-[11px] uppercase tracking-wider transition-colors hover:text-white",
              mode === "multiple" ? "text-white" : "text-zinc-500"
            )}
          >
            Múltiples servidores
          </button>
        </div>
      </div>

      {mode === "single" ? (
        <SingleServerQueueModule embedded />
      ) : (
        <MultipleServersQueueModule embedded />
      )}
    </div>
  );
}
