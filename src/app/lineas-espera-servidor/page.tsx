"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, BarChart3, ChevronLeft, ChevronRight, Info, Server } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GlossaryPopoverLink from "@/components/GlossaryPopoverLink";
import {
  calculateSingleServerLimited,
  calculateSingleServerUnlimited,
  SingleServerQueueMetrics,
  SingleServerQueueModel,
} from "@/lib/single-server-queues";
import { useSessionState } from "@/lib/use-session-state";
import { cn } from "@/lib/utils";

const chartConfig = {
  p: {
    label: "Probabilidad",
    color: "#ffffff",
  },
} satisfies ChartConfig;

export function SingleServerQueueModule({ embedded = false }: { embedded?: boolean } = {}) {
  useEffect(() => {
    document.title = "Líneas de espera de un servidor | distrosolve";
  }, []);

  const [model, setModel] = useSessionState<SingleServerQueueModel>(
    "single-server-queue:model",
    "mm1"
  );
  const [lambda, setLambda] = useSessionState("single-server-queue:lambda", 5);
  const [serviceRate, setServiceRate] = useSessionState("single-server-queue:serviceRate", 8);
  const [capacity, setCapacity] = useSessionState("single-server-queue:capacity", 10);
  const [results, setResults] = useSessionState<SingleServerQueueMetrics | null>(
    "single-server-queue:results",
    null
  );
  const [error, setError] = useSessionState<string | null>("single-server-queue:error", null);
  const [hasCalculated, setHasCalculated] = useSessionState(
    "single-server-queue:hasCalculated",
    false
  );
  const [isCalculating, setIsCalculating] = useState(false);

  const chartData = useMemo(() => results?.pn ?? [], [results]);

  const calculate = () => {
    setError(null);
    setIsCalculating(true);

    const output = model === "mm1"
      ? calculateSingleServerUnlimited(lambda, serviceRate)
      : calculateSingleServerLimited(lambda, serviceRate, capacity);

    if (typeof output === "string") {
      setResults(null);
      setHasCalculated(false);
      setError(output);
    } else {
      setResults(output);
      setHasCalculated(true);
    }

    setIsCalculating(false);
  };

  return (
    <div className={cn("mx-auto w-full max-w-[1120px] space-y-6", embedded ? "" : "p-4 pb-24 md:p-6")}>
      {!embedded && (
      <div className="space-y-3">
        <div className="flex items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
          <span>distrosolve</span>
          <span className="mx-2 text-zinc-800">/</span>
          <span className="text-zinc-300">líneas de espera</span>
        </div>
        <div>
          <h1 className="font-mono text-2xl font-medium tracking-tight text-white">
            Líneas de espera de un servidor
          </h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-zinc-400">
            Calcula sistemas M/M/1 sin límite en cola y M/M/1/K con capacidad finita.
          </p>
        </div>
        <div className="relative flex h-10 w-full max-w-md overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1">
          <span className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-zinc-800 transition-transform duration-300 ease-out" />
          <Link
            href="/lineas-espera/un-servidor"
            className="relative z-10 flex flex-1 items-center justify-center rounded-md px-3 text-center font-mono text-[11px] uppercase tracking-wider text-white"
          >
            Un servidor
          </Link>
          <Link
            href="/lineas-espera/multiples-servidores"
            className="relative z-10 flex flex-1 items-center justify-center rounded-md px-3 text-center font-mono text-[11px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-white"
          >
            Múltiples servidores
          </Link>
        </div>
      </div>
      )}

      <div className={cn(
        "grid gap-6 lg:grid-cols-[390px_1fr]",
        hasCalculated ? "items-start" : "items-stretch"
      )}>
        <div className="flex flex-col gap-6">
        <Card className="relative rounded-xl border-zinc-800 bg-zinc-900 text-white">
          <div className="absolute top-3 right-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="bento-info-trigger">
                  <Info className="bento-info-icon" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-300">
                <div className="space-y-3">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-white">Línea de espera de un servidor</h4>
                  <p className="popover-copy">
                    Modelo M/M/1 o M/M/1/K para estudiar una sola estación de atención, sus tasas, capacidad y métricas de espera.
                  </p>
                  <GlossaryPopoverLink href="/glossary#lineas-espera" />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-normal">
              <Server className="h-4 w-4 text-zinc-500" />
              Datos del sistema
            </CardTitle>
            <CardDescription className="card-description-copy">
              Suministra las tasas y, si aplica, la capacidad máxima K.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Tabs
              value={model}
              onValueChange={(value) => setModel(value as SingleServerQueueModel)}
            >
              <TabsList className="relative mb-2 h-10 w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-1">
                <span
                  className={cn(
                    "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-zinc-800 transition-transform duration-300 ease-out",
                    model === "mm1k" && "translate-x-full"
                  )}
                />
                <TabsTrigger
                  value="mm1"
                  className="relative z-10 flex-1 bg-transparent font-mono text-[11px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-white data-[state=active]:bg-transparent data-[state=active]:text-white"
                >
                  Sin límite
                </TabsTrigger>
                <TabsTrigger
                  value="mm1k"
                  className="relative z-10 flex-1 bg-transparent font-mono text-[11px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-white data-[state=active]:bg-transparent data-[state=active]:text-white"
                >
                  Con límite
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <NumberInput
              label="Tasa de llegada (λ)"
              value={lambda}
              min={0}
              step={0.1}
              onChange={setLambda}
            />
            <NumberInput
              label="Tasa de servicio (μ)"
              value={serviceRate}
              min={0.1}
              step={0.1}
              onChange={setServiceRate}
            />

            <div className={cn("transition-all", model === "mm1k" ? "block" : "hidden")}>
              <NumberInput
                label="Capacidad del sistema (K)"
                value={capacity}
                min={1}
                step={1}
                onChange={(value) => setCapacity(Math.max(1, Math.trunc(value)))}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/20 p-3 font-mono text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={calculate}
              className="h-16 w-full rounded-xl bg-white font-mono text-xs uppercase tracking-[0.2em] text-black hover:bg-zinc-200"
              disabled={isCalculating}
            >
              Calcular métricas
            </Button>
          </CardContent>
        </Card>
        </div>

        <Card className={cn(
          "rounded-xl border-zinc-800 bg-zinc-900 text-white",
          !hasCalculated && "h-full"
        )}>
          <CardHeader className="border-b border-zinc-800/50">
            <CardTitle className="flex items-center gap-2 font-mono text-sm font-normal">
              <BarChart3 className="h-4 w-4 text-zinc-500" />
              Resultados
            </CardTitle>
            <CardDescription className="card-description-copy">
              Indicadores del servidor, la cola y la distribución P(n).
            </CardDescription>
          </CardHeader>
          <CardContent className={cn("p-0", !hasCalculated && "flex flex-1")}>
            {!hasCalculated || !results ? (
              <div className="flex h-full flex-1 items-center justify-center p-6 text-center">
                <p className="max-w-sm text-[13px] leading-5 text-zinc-500">
                  Ejecuta el cálculo para visualizar rho, P0, promedios, tiempos y probabilidades.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_1.1fr]">
                <div className="grid grid-cols-2 border-b border-zinc-800 lg:border-b-0 lg:border-r">
                  <Metric label="Rho" value={`${(results.rho * 100).toFixed(2)}%`} sub="Utilización" />
                  <Metric label="Tasa servicio" value={format(results.serviceRate)} sub="μ" />
                  <Metric label="P0" value={`${(results.p0 * 100).toFixed(2)}%`} sub="Sistema vacío" />
                  <Metric label="L" value={format(results.L)} sub="Clientes sistema" />
                  <Metric label="Lq" value={format(results.Lq)} sub="Clientes cola" />
                  <Metric label="W" value={format(results.W)} sub="Tiempo sistema" />
                  <Metric label="Wq" value={format(results.Wq)} sub="Tiempo cola" />
                  <Metric label="λ efectiva" value={format(results.lambdaEff)} sub="Entrada real" />
                  {results.model === "mm1k" && (
                    <>
                      <Metric label="λ perdida" value={format(results.lambdaLost)} sub="Rechazo" />
                      <Metric label="PK" value={`${((results.pk ?? 0) * 100).toFixed(2)}%`} sub="Sistema lleno" />
                    </>
                  )}
                </div>

                <div className="min-h-[360px] p-4 sm:p-6">
                  <div className="mb-4">
                    <h2 className="font-mono text-xs uppercase tracking-wider text-white">
                      Distribución de probabilidad
                    </h2>
                    <p className="mt-1 text-[13px] text-zinc-500">
                      Probabilidad de encontrar exactamente n clientes en el sistema.
                    </p>
                  </div>
                  <div className="h-[285px]">
                    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-800/50">
                      <BarChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="n"
                          stroke="#71717a"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#71717a"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${(Number(value) * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="p" fill="#ffffff" name="Probabilidad" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SingleServerQueuePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/lineas-espera");
  }, [router]);

  return <SingleServerQueueModule embedded />;
}

function NumberInput({
  label,
  value,
  min,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step: number;
  onChange: (value: number) => void;
}) {
  const decrement = () => onChange(Math.max(min, Number((value - step).toFixed(4))));
  const increment = () => onChange(Number((value + step).toFixed(4)));

  return (
    <div className="space-y-2">
      <Label className="technical-label text-white">{label}</Label>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="rounded-none border-zinc-800 bg-zinc-950 text-center font-mono text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          className="h-9 w-9 shrink-0 rounded-none border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          className="h-9 w-9 shrink-0 rounded-none border-zinc-800 bg-zinc-950 text-white hover:bg-zinc-900"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="min-h-24 border-b border-r border-zinc-800 p-4">
      <div className="technical-caption text-zinc-500">{label}</div>
      <div className="mt-2 break-words font-mono text-2xl text-white">{value}</div>
      <div className="mt-1 font-mono text-[10px] text-zinc-600">{sub}</div>
    </div>
  );
}

function format(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : "0.0000";
}
