"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Info, 
  Users, 
  ArrowRight, 
  Clock, 
  UserPlus, 
  Server, 
  BarChart3,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { 
  calculateMM1, 
  calculateMM1K, 
  QueueMetrics 
} from '@/lib/queues';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell
} from "recharts";

const chartConfig = {
  p: {
    label: "Probabilidad",
    color: "#ffffff",
  },
} satisfies ChartConfig;

export default function QueuesPage() {
  useEffect(() => {
    document.title = "Teoría de colas | distrosolve";
  }, []);

  const [model, setModel] = useState<"mm1" | "mm1k">("mm1");
  const [lambda, setLambda] = useState<number>(5);
  const [mu, setMu] = useState<number>(8);
  const [K, setK] = useState<number>(10);
  
  // Estado para controlar la visibilidad de los resultados
  const [hasCalculated, setHasCalculated] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // Estado con los valores calculados (desacoplados de los inputs)
  const [results, setResults] = useState<QueueMetrics | null>(null);
  const [calcModel, setCalcModel] = useState<"mm1" | "mm1k">("mm1");
  const [calcK, setCalcK] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  // Efecto para hacer scroll a la gráfica cuando aparece (solo la primera vez)
  useEffect(() => {
    if (showGraph && graphRef.current && !isGraphLoading && !hasScrolled) {
      setTimeout(() => {
        graphRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHasScrolled(true);
      }, 100);
    }
  }, [showGraph, isGraphLoading, hasScrolled]);

  const handleCalculate = () => {
    setError(null);
    const res = model === "mm1" 
      ? calculateMM1(lambda, mu)
      : calculateMM1K(lambda, mu, K);

    if (typeof res === "string") {
      setError(res);
      setHasCalculated(false);
      setShowGraph(false);
      setResults(null);
    } else {
      setHasCalculated(true);
      setIsGraphLoading(true);
      
      // Simulamos carga para feedback visual
      setTimeout(() => {
        setResults(res);
        setCalcModel(model);
        setCalcK(K);
        setIsGraphLoading(false);
        
        // Delay extra para mostrar la gráfica después del desempeño
        setTimeout(() => {
          setShowGraph(true);
        }, 400);
      }, 600);
    }
  };

  return (
    <div className="p-6 space-y-6 mx-auto transition-all duration-700 pb-24">
      <div className={cn(
        "flex flex-col space-y-4 mb-6 mx-auto transition-all duration-700 ease-in-out",
        hasCalculated ? "max-w-[920px]" : "max-w-md"
      )}>
        <div className="flex items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
          <span>distrosolve</span>
          <span className="mx-2 text-zinc-800">/</span>
          <span className="text-zinc-300">teoría de colas</span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-white font-mono">
          Modelos de teorías de colas
        </h1>
      </div>

      <div className={cn(
        "flex flex-col md:flex-row justify-start items-start gap-0 transition-all duration-1000 ease-in-out mx-auto",
        hasCalculated ? "max-w-[920px]" : "max-w-md"
      )}>
        {/* Columna Izquierda: Configuración */}
        <div className={cn(
          "w-full max-w-md transition-all duration-1000 ease-in-out shrink-0 space-y-6",
          hasCalculated && "md:mr-6"
        )}>
          <Card className="bg-zinc-900 border-zinc-800 text-white rounded-xl relative">
            <div className="absolute top-3 right-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-zinc-800 rounded-full">
                    <Info className="h-3.5 w-3.5 text-zinc-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-300">
                  <div className="space-y-3">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-white">Configuración del Modelo</h4>
                    <p className="text-xs leading-relaxed">
                      Define el modelo de colas (M/M/1 o M/M/1/K) y ajusta las tasas de llegada y servicio para analizar el comportamiento del sistema.
                    </p>
                    <Link 
                      href="/glossary" 
                      className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-tight text-white hover:text-zinc-300 transition-colors border-t border-zinc-800 pt-2 w-full"
                    >
                      Ver en glosario <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <CardHeader className="pb-3 flex flex-col items-start text-left">
              <CardTitle className="text-sm font-normal flex items-center justify-start gap-2 font-mono text-white">
                <Server className="w-4 h-4 text-zinc-500" />
                Configuración
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-xs">
                Selecciona el modelo y define las tasas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 pb-0">
              <Tabs 
                defaultValue="mm1" 
                onValueChange={(val) => setModel(val as any)}
                className="w-full"
              >
                <TabsList className="bg-zinc-950 border border-zinc-800 w-full h-10 p-1 rounded-lg mb-6">
                  <TabsTrigger 
                    value="mm1" 
                    className="flex-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all"
                  >
                    Infinito (M/M/1)
                  </TabsTrigger>
                  <TabsTrigger 
                    value="mm1k" 
                    className="flex-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-all"
                  >
                    Finito (M/M/1/K)
                  </TabsTrigger>
                </TabsList>

                <div className="flex flex-col gap-4">
                  <div className="space-y-2 flex flex-col items-start">
                    <div className="flex items-center justify-start gap-1.5 h-4">
                      <Label className="text-white text-[10px] font-mono uppercase tracking-wider">Tasa de Llegada (λ)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-zinc-600" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Frecuencia de entrada de clientes
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-1 w-full justify-center">
                      <Input 
                        type="number" 
                        value={lambda} 
                        onChange={(e) => setLambda(Number(e.target.value))}
                        className="bg-zinc-950 border-zinc-800 text-white rounded-none font-mono text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-grow"
                        placeholder="λ"
                      />
                      <Button 
                        variant="outline" size="icon" className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                        onClick={() => setLambda(Math.max(0, Number((lambda - 0.1).toFixed(1))))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" size="icon" className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                        onClick={() => setLambda(Number((lambda + 0.1).toFixed(1)))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col items-start">
                    <div className="flex items-center justify-start gap-1.5 h-4">
                      <Label className="text-white text-[10px] font-mono uppercase tracking-wider">Tasa de Servicio (μ)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-4 h-4 text-zinc-600" />
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          Capacidad de atención del servidor
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center space-x-1 w-full justify-center">
                      <Input 
                        type="number" 
                        value={mu} 
                        onChange={(e) => setMu(Number(e.target.value))}
                        className="bg-zinc-950 border-zinc-800 text-white rounded-none font-mono text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-grow"
                        placeholder="μ"
                      />
                      <Button 
                        variant="outline" size="icon" className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                        onClick={() => setMu(Math.max(0.1, Number((mu - 0.1).toFixed(1))))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" size="icon" className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                        onClick={() => setMu(Number((mu + 0.1).toFixed(1)))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out flex flex-col items-start",
                    model === "mm1k" ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <div className="pt-4 space-y-2 w-full flex flex-col items-start">
                      <div className="flex items-center justify-start gap-1.5 h-4">
                        <Label className="text-white text-[10px] font-mono uppercase tracking-wider">Capacidad Sistema (K)</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="w-4 h-4 text-zinc-600" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            Límite máximo de clientes permitidos
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center space-x-1 w-full justify-center">
                        <Input 
                          type="number" 
                          value={K} 
                          onChange={(e) => setK(Number(e.target.value))}
                          className="bg-zinc-950 border-zinc-800 text-white rounded-none font-mono text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-grow"
                        />
                        <Button 
                          variant="outline" size="icon" className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                          onClick={() => setK(Math.max(1, K - 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" size="icon" className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                          onClick={() => setK(K + 1)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-950/20 border border-red-900/50 rounded-lg text-red-400 text-xs font-mono animate-in shake-in duration-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>

          <Button 
            onClick={handleCalculate}
            className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl font-mono uppercase tracking-[0.2em] text-xs h-16 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
          >
            Calcular Métricas
          </Button>
        </div>

        {/* Columna Derecha: Resultados (Solo aparece si hasCalculated es true) */}
        <div className={cn(
          "transition-all duration-700 ease-in-out shrink-0 flex flex-col self-stretch",
          hasCalculated ? "w-full max-w-md opacity-100 overflow-visible" : "w-0 opacity-0 pointer-events-none overflow-hidden"
        )}>
          <Card className="bg-zinc-900 border-zinc-800 text-white rounded-xl relative h-full animate-in fade-in duration-700 flex flex-col">
            <div className="absolute top-3 right-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 p-0 hover:bg-zinc-800 rounded-full">
                    <Info className="h-3.5 w-3.5 text-zinc-600" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-300">
                  <div className="space-y-3">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-white">Desempeño del Sistema</h4>
                    <p className="text-xs leading-relaxed">
                      Muestra los indicadores clave del modelo seleccionado, incluyendo el tiempo de espera, el número de clientes en cola y la utilización del servidor.
                    </p>
                    <Link 
                      href="/glossary#metricas" 
                      className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-tight text-white hover:text-zinc-300 transition-colors border-t border-zinc-800 pt-2 w-full"
                    >
                      Ver en glosario <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <CardHeader className="pb-3 flex flex-col items-start text-left">
              <CardTitle className="text-sm font-normal flex items-center justify-start gap-2 font-mono text-white">
                <BarChart3 className="w-4 h-4 text-zinc-500" />
                Desempeño del sistema
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-xs">
                Resultados para {calcModel === "mm1" ? "cola infinita" : `límite de ${calcK} clientes`}.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t border-zinc-800/50 flex-grow flex flex-col pb-0">
              {results && (
                <div 
                  key={JSON.stringify(results)} 
                  className="flex-grow flex flex-col relative pt-4 animate-in fade-in duration-1000"
                >
                  {/* Línea divisoria vertical que va de arriba a abajo */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-zinc-800 z-10" />
                  
                  <div className="flex-grow grid grid-cols-2 border-b border-zinc-800">
                    <div className="flex flex-col divide-y divide-zinc-800">
                      <MetricItem 
                        label="Utilización (Rho)" 
                        value={`${(results.rho * 100).toFixed(2)}%`} 
                        sub="Factor de carga" 
                        tooltip="Probabilidad de que el servidor esté ocupado"
                      />
                      <MetricItem 
                        label="Clientes Sistema (L)" 
                        value={results.L.toFixed(4)} 
                        sub="Promedio total" 
                        tooltip="Número promedio de clientes en el sistema (cola + servicio)"
                      />
                      <MetricItem 
                        label="Tiempo Sistema (W)" 
                        value={results.W.toFixed(4)} 
                        sub="Tiempo total prom." 
                        tooltip="Tiempo promedio de permanencia en el sistema"
                      />
                      {calcModel === "mm1k" && (
                        <MetricItem 
                          label="λ Efectiva" 
                          value={results.lambdaEff?.toFixed(4) || "0"} 
                          sub="Tasa real entrada" 
                          tooltip="Tasa real de clientes que ingresan al sistema"
                        />
                      )}
                    </div>
                    <div className="flex flex-col divide-y divide-zinc-800">
                      <MetricItem 
                        label="Prob. Vacío (P0)" 
                        value={`${(results.p0 * 100).toFixed(2)}%`} 
                        sub="Prob. Ociosidad" 
                        tooltip="Probabilidad de que el sistema esté vacío"
                      />
                      <MetricItem 
                        label="Clientes Cola (Lq)" 
                        value={results.Lq.toFixed(4)} 
                        sub="En espera" 
                        tooltip="Número promedio de clientes esperando en la cola"
                      />
                      <MetricItem 
                        label="Tiempo Cola (Wq)" 
                        value={results.Wq.toFixed(4)} 
                        sub="Tiempo espera prom." 
                        tooltip="Tiempo promedio de espera en la cola"
                      />
                      {calcModel === "mm1k" && (
                        <MetricItem 
                          label="λ Perdida" 
                          value={results.lambdaLost?.toFixed(4) || "0"} 
                          sub="Rechazados" 
                          tooltip="Tasa de clientes rechazados por sistema lleno"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bloque Inferior: Gráfica (Separado y de ancho completo) */}
      {showGraph && (
        <div 
          ref={graphRef}
          className="mx-auto max-w-[920px] w-full mt-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
        >
          <Card className="bg-zinc-900 border-zinc-800 text-white rounded-xl overflow-hidden min-h-[450px] flex flex-col relative">
            {/* Overlay de Carga */}
            {isGraphLoading && (
              <div className="absolute inset-0 z-50 bg-zinc-900/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin"></div>
                  <BarChart3 className="w-5 h-5 text-white absolute inset-0 m-auto animate-pulse" />
                </div>
                <span className="mt-4 text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em] animate-pulse">
                  Generando visualización...
                </span>
              </div>
            )}

            <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
              <CardTitle className="text-sm font-normal flex items-center gap-2 font-mono text-white uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-zinc-500" />
                Distribución de Probabilidad P(n)
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-xs">
                Probabilidad de encontrar exactamente 'n' clientes en el sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-10">
              {results && (
                <div className="h-[300px] w-full">
                  <ChartContainer config={chartConfig} className="w-full h-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-800/50">
                    <BarChart data={results.pn} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis 
                        dataKey="n" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        label={{ value: 'n (Clientes)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                      />
                      <ChartTooltip 
                        content={
                          <ChartTooltipContent 
                            labelClassName="text-black font-bold"
                          />
                        } 
                      />
                      <Bar 
                        dataKey="p" 
                        fill="#ffffff" 
                        name="Probabilidad" 
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value, sub, className, tooltip }: { label: string; value: string; sub: string, className?: string, tooltip?: string }) {
  return (
    <div className={cn("p-6 flex flex-col space-y-1 relative group", className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{label}</span>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-zinc-700" />
            </TooltipTrigger>
            <TooltipContent side="right">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className="text-2xl font-normal text-white font-mono">{value}</span>
      <span className="text-[9px] text-zinc-600 font-mono">{sub}</span>
    </div>
  );
}
