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
  Check, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Sigma, 
  HelpCircle, 
  BarChart3, 
  Binary
} from 'lucide-react';
import GlossaryPopoverLink from '@/components/GlossaryPopoverLink';
import { runMonteCarloSimulation, generateHistogramData, MonteCarloStats } from '@/lib/montecarlo';
import { ProbType } from '@/lib/distributions';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useSessionState } from "@/lib/use-session-state";

type DistributionType = "Poisson" | "Exponencial";

const distributions: { value: DistributionType; label: string }[] = [
  { value: "Poisson", label: "Poisson (Discreta)" },
  { value: "Exponencial", label: "Exponencial (Continua)" },
];

const probTypes: { value: ProbType; label: string }[] = [
  { value: "P(X = xi)", label: "Probabilidad puntual (x = xi)" },
  { value: "P(X <= xi)", label: "Cola inferior acumulada (x ≤ xi)" },
  { value: "P(X < xi)", label: "Cola inferior estricta (x < xi)" },
  { value: "P(X >= xi)", label: "Cola superior acumulada (x ≥ xi)" },
  { value: "P(X > xi)", label: "Cola superior estricta (x > xi)" },
  { value: "P(xi <= X <= xj)", label: "Intervalo inclusivo (xi ≤ x ≤ xj)" },
  { value: "P(xi < X < xj)", label: "Intervalo estricto (xi < x < xj)" },
  { value: "P(xi <= X < xj)", label: "Intervalo inclusivo inferior (xi ≤ x < xj)" },
  { value: "P(xi < X <= xj)", label: "Intervalo inclusivo superior (xi < x <= xj)" },
];

const sampleSizes = [
  { value: 500, label: "500 iteraciones" },
  { value: 1000, label: "1,000 iteraciones" },
  { value: 5000, label: "5,000 iteraciones" },
  { value: 10000, label: "10,000 iteraciones" },
  { value: 50000, label: "50,000 iteraciones" },
];

const chartConfig = {
  percentage: {
    label: "Simulado",
    color: "#ffffff",
  },
  theoreticalProb: {
    label: "Teórico",
    color: "#a1a1aa",
  },
} satisfies ChartConfig;

export default function MonteCarloPage() {
  useEffect(() => {
    document.title = "Simulación de Montecarlo | distrosolve";
  }, []);

  const [hasVisited, setHasVisited] = useSessionState("montecarlo:hasVisited", false);
  const [shouldRunEntryAnimations] = useState(() => !hasVisited);

  useEffect(() => {
    if (!hasVisited) {
      setHasVisited(true);
    }
  }, [hasVisited, setHasVisited]);

  // --- Estado de Entrada ---
  const [distType, setDistType] = useSessionState<DistributionType>("montecarlo:distType", "Poisson");
  const [openDist, setOpenDist] = useState(false);
  const [param, setParam] = useSessionState<number>("montecarlo:param", 5);
  const [sampleSize, setSampleSize] = useSessionState<number>("montecarlo:sampleSize", 5000);
  const [openSamples, setOpenSamples] = useState(false);
  const [probType, setProbType] = useSessionState<ProbType>("montecarlo:probType", "P(X <= xi)");
  const [openProb, setOpenProb] = useState(false);
  const [xi, setXi] = useSessionState<number>("montecarlo:xi", 3);
  const [xj, setXj] = useSessionState<number>("montecarlo:xj", 6);
  const [precision, setPrecision] = useSessionState<number>("montecarlo:precision", 4);

  // --- Control de Resultados ---
  const [hasCalculated, setHasCalculated] = useSessionState("montecarlo:hasCalculated", false);
  const [showGraph, setShowGraph] = useSessionState("montecarlo:showGraph", false);
  const [hasScrolled, setHasScrolled] = useSessionState("montecarlo:hasScrolled", false);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // --- Datos de simulación "congelados" ---
  const [simResults, setSimResults] = useSessionState<MonteCarloStats | null>("montecarlo:simResults", null);
  const [calcDistType, setCalcDistType] = useSessionState<DistributionType>("montecarlo:calcDistType", "Poisson");
  const [calcParam, setCalcParam] = useSessionState<number>("montecarlo:calcParam", 5);

  useEffect(() => {
    if (showGraph && graphRef.current && !isGraphLoading && !hasScrolled) {
      setTimeout(() => {
        graphRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHasScrolled(true);
      }, 100);
    }
  }, [showGraph, isGraphLoading, hasScrolled, setHasScrolled]);

  const handleSimulate = () => {
    // Ejecutar simulación
    const res = runMonteCarloSimulation(distType, param, sampleSize, probType, xi, xj);
    setSimResults(res);
    setCalcDistType(distType);
    setCalcParam(param);
    setHasCalculated(true);
    setShowGraph(false); // Reinicia gráfica para que la vuelva a generar
  };

  const handleGenerateGraph = () => {
    setHasScrolled(false);
    setIsGraphLoading(true);
    setShowGraph(true);

    setTimeout(() => {
      setIsGraphLoading(false);
    }, 800);
  };

  const chartData = useMemo(() => {
    if (!simResults) return [];
    return generateHistogramData(simResults.rawSamples, calcDistType, calcParam, calcDistType === "Poisson" ? 30 : 15);
  }, [simResults, calcDistType, calcParam]);

  return (
    <div className="p-4 md:p-6 space-y-6 mx-auto transition-all duration-700 pb-24">
      {/* Encabezado */}
      <div className={cn(
        "flex flex-col space-y-4 mb-6 mx-auto transition-all duration-1000 ease-in-out",
        hasCalculated ? "max-w-[920px]" : "max-w-md"
      )}>
        <div className="flex items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
          <span>monte carlo</span>
          <span className="mx-2 text-zinc-800">/</span>
          <span className="text-zinc-300">simulador</span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-white font-mono">
          Simulación de Montecarlo
        </h1>
      </div>

      <div className={cn(
        "flex flex-col md:flex-row justify-start items-stretch gap-6 md:gap-0 transition-all duration-1000 ease-in-out mx-auto",
        hasCalculated ? "max-w-[920px]" : "max-w-md"
      )}>
        
        {/* Columna Izquierda: Configuración de la Simulación */}
        <div className={cn(
          "w-full max-w-md transition-all duration-1000 ease-in-out shrink-0",
          hasCalculated ? "md:mr-6 overflow-visible" : "overflow-hidden"
        )}>
          <Card className="bg-zinc-900 border-zinc-800 text-white rounded-xl relative flex flex-col h-full">
            <div className="absolute top-3 right-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="bento-info-trigger">
                    <Info className="bento-info-icon" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-300">
                  <div className="space-y-3">
                    <h4 className="font-mono text-xs uppercase tracking-wider text-white">Método de Montecarlo</h4>
                    <p className="popover-copy">
                      Este módulo aproxima el comportamiento de variables aleatorias a través del muestreo repetido (generación aleatoria de números). Compara la convergencia empírica frente a los modelos teóricos con base en la Ley de los Grandes Números.
                    </p>
                    <GlossaryPopoverLink href="/glossary#montecarlo" />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <CardHeader className="pb-3 flex flex-col items-start text-left">
              <CardTitle className="text-sm font-normal flex items-center justify-start gap-2 font-mono text-white">
                <Binary className="w-4 h-4 text-zinc-500" />
                Configurar simulación
              </CardTitle>
              <CardDescription className="card-description-copy">
                Establece la distribución y la cantidad de muestras aleatorias.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 flex-grow pt-4 pb-0 overflow-visible">
              
              {/* Selector de Distribución */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col items-start">
                  <div className="flex items-center justify-start h-4">
                    <Label className="technical-label text-white">Distribución</Label>
                  </div>
                  <Popover open={openDist} onOpenChange={setOpenDist}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openDist}
                        className="w-full justify-between bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 hover:text-zinc-200 font-normal"
                      >
                        {distType
                          ? distributions.find((d) => d.value === distType)?.label
                          : "Selecciona..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none! border-zinc-700 bg-zinc-800">
                      <Command className="bg-zinc-800 text-white p-0 rounded-none!">
                        <CommandList className="p-0 rounded-none!">
                          <CommandEmpty>No se encontró.</CommandEmpty>
                          <CommandGroup className="p-0 rounded-none!">
                            {distributions.map((dist) => (
                              <CommandItem
                                key={dist.value}
                                value={dist.value}
                                onSelect={(currentValue) => {
                                  setDistType(currentValue as DistributionType);
                                  setOpenDist(false);
                                }}
                                className="text-white data-selected:bg-zinc-700 data-selected:text-white aria-selected:bg-zinc-700 cursor-pointer rounded-none! p-0"
                              >
                                <div className="flex items-center w-full px-2 py-1.5">
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-white!",
                                      distType === dist.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {dist.label}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Parámetro de Tasa/Promedio */}
                <div className="space-y-2 flex flex-col items-start">
                  <div className="flex items-center justify-start gap-1.5 h-4">
                    <Label htmlFor="param" className="technical-label text-white uppercase">
                      {distType === "Poisson" ? (
                        <>Promedio (<span className="normal-case">μ</span>)</>
                      ) : (
                        <>Tasa (<span className="normal-case">λ</span>)</>
                      )}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline-help-icon" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {distType === "Poisson" ? "Mu (Promedio de la distribución)" : "Lambda (Tasa del decaimiento)"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-1 w-full justify-center">
                    <Input 
                      id="param" 
                      type="number" 
                      step="0.1"
                      min="0.1"
                      max="30.0"
                      value={param} 
                      onChange={(e) => setParam(Number(e.target.value))}
                      className="bg-zinc-950 border-zinc-800 text-white rounded-none font-mono text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-grow"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                      onClick={() => setParam(Math.max(0.1, Number((param - 0.1).toFixed(1))))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                      onClick={() => setParam(Math.min(30, Number((param + 0.1).toFixed(1))))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Muestras a Simular (Iteraciones N) */}
              <div className="space-y-2 flex flex-col items-start">
                <Label className="technical-label text-white mb-1">Muestras (Tamaño de simulación)</Label>
                <Popover open={openSamples} onOpenChange={setOpenSamples}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSamples}
                      className="w-full justify-between bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 hover:text-zinc-200 font-mono text-xs font-normal"
                    >
                      {sampleSize ? `${sampleSize.toLocaleString()} iteraciones` : "Selecciona iteraciones..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none! border-zinc-700 bg-zinc-800">
                    <Command className="bg-zinc-800 text-white p-0 rounded-none!">
                      <CommandList className="p-0 rounded-none!">
                        <CommandGroup className="p-0 rounded-none!">
                          {sampleSizes.map((sz) => (
                            <CommandItem
                              key={sz.value}
                              value={sz.value.toString()}
                              onSelect={() => {
                                setSampleSize(sz.value);
                                setOpenSamples(false);
                              }}
                              className="text-white data-selected:bg-zinc-700 data-selected:text-white aria-selected:bg-zinc-700 cursor-pointer rounded-none! p-0"
                            >
                              <div className="flex items-center w-full px-2 py-1.5 font-mono text-xs">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-white!",
                                    sampleSize === sz.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {sz.label}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Rango de Comparación de Probabilidades */}
              <div className="space-y-2 flex flex-col items-start border-t border-zinc-800/80 pt-4">
                <Label className="technical-label text-white mb-1">Rango para comparar probabilidad</Label>
                <Popover open={openProb} onOpenChange={setOpenProb}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openProb}
                      className="w-full justify-between bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 hover:text-zinc-200 font-normal"
                    >
                      {probType
                        ? probTypes.find((p) => p.value === probType)?.label
                        : "Selecciona intervalo..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-none! border-zinc-700 bg-zinc-800">
                    <Command className="bg-zinc-800 text-white p-0 rounded-none!">
                      <CommandList className="p-0 rounded-none!">
                        <CommandEmpty>No se encontró.</CommandEmpty>
                        <CommandGroup className="p-0 rounded-none!">
                          {probTypes.map((p) => (
                            <CommandItem
                              key={p.value}
                              value={p.value}
                              onSelect={(currentValue) => {
                                setProbType(currentValue as ProbType);
                                setOpenProb(false);
                              }}
                              className="text-white data-selected:bg-zinc-700 data-selected:text-white aria-selected:bg-zinc-700 cursor-pointer rounded-none! p-0"
                            >
                              <div className="flex items-center w-full px-2 py-1.5">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4 text-white!",
                                    probType === p.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {p.label}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Parámetros xi / xj */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col items-start">
                  <div className="flex items-center justify-start gap-1.5">
                    <Label className="technical-label text-white lowercase">xi</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline-help-icon" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Límite inferior del rango
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-1 w-full justify-center">
                    <Input 
                      type="number" 
                      step="0.1"
                      value={xi} 
                      onChange={(e) => setXi(Number(e.target.value))}
                      className="bg-zinc-950 border-zinc-800 rounded-none font-mono text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-grow"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                      onClick={() => setXi(Math.max(0, Number((xi - 0.1).toFixed(1))))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 shrink-0"
                      onClick={() => setXi(Number((xi + 0.1).toFixed(1)))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 flex flex-col items-start">
                  <div className="flex items-center justify-start gap-1.5">
                    <Label className="technical-label text-white lowercase">xj</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline-help-icon" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Límite superior del rango
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-1 w-full justify-center">
                    <Input 
                      type="number" 
                      step="0.1"
                      value={xj} 
                      disabled={!probType.includes('xj')}
                      onChange={(e) => setXj(Number(e.target.value))}
                      className="bg-zinc-950 border-zinc-800 disabled:opacity-30 rounded-none font-mono text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-grow"
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 disabled:opacity-30 shrink-0"
                      disabled={!probType.includes('xj')}
                      onClick={() => setXj(Math.max(0, Number((xj - 0.1).toFixed(1))))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-9 w-9 bg-zinc-950 border-zinc-800 text-white rounded-none hover:bg-zinc-900 disabled:opacity-30 shrink-0"
                      disabled={!probType.includes('xj')}
                      onClick={() => setXj(Number((xj + 0.1).toFixed(1)))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Botón Ejecutar */}
              <Button 
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-none font-mono uppercase tracking-widest text-xs h-12"
                onClick={handleSimulate}
              >
                Ejecutar Simulación
              </Button>

              {/* Control de precisión decimal */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-none flex flex-col items-center overflow-hidden py-3">
                <span className="technical-caption text-zinc-500 mb-1">Ajuste de precisión</span>
                <div className="flex items-center space-x-1">
                  <Input 
                    type="number" 
                    value={precision} 
                    readOnly
                    tabIndex={-1}
                    className="h-7 w-12 bg-zinc-900 border-zinc-800 text-white rounded-none font-mono text-center text-xs pointer-events-none select-none"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 bg-zinc-900 border-zinc-800 text-white rounded-none hover:bg-zinc-800"
                    onClick={() => setPrecision(Math.max(0, precision - 1))}
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 bg-zinc-900 border-zinc-800 text-white rounded-none hover:bg-zinc-900"
                    onClick={() => setPrecision(Math.min(9, precision + 1))}
                  >
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Análisis de Resultados */}
        <div className={cn(
          "transition-all duration-700 ease-in-out shrink-0 flex flex-col",
          hasCalculated ? "w-full max-w-md opacity-100 overflow-visible" : "w-0 opacity-0 pointer-events-none overflow-hidden"
        )}>
          {simResults && (
            <div className="w-full h-full flex flex-col gap-6">
              
              {/* Cuadro de Estadísticos */}
              <Card 
                key={`sim-stats-${JSON.stringify(simResults.sampleSize)}-${simResults.simulatedMean}`}
                className={cn(
                  "bg-zinc-900 border-zinc-800 text-white rounded-xl relative flex flex-col flex-grow",
                  shouldRunEntryAnimations && "animate-in fade-in duration-700"
                )}
              >
                <div className="absolute top-3 right-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="bento-info-trigger">
                        <Info className="bento-info-icon" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-300">
                      <div className="space-y-3">
                        <h4 className="font-mono text-xs uppercase tracking-wider text-white">Resultados Muestrales</h4>
                        <p className="popover-copy">
                          Compara las métricas obtenidas a partir de las muestras simuladas frente a los valores teóricos exactos de la distribución de probabilidad.
                        </p>
                        <GlossaryPopoverLink href="/glossary#convergencia" />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-normal flex items-center gap-2 font-mono text-white">
                    <Sigma className="w-4 h-4 text-zinc-500" />
                    Comparación estadística
                  </CardTitle>
                  <CardDescription className="card-description-copy">
                    Valores Simulados vs. Teóricos (N = {simResults.sampleSize.toLocaleString()}).
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow flex flex-col justify-start pt-2">
                  <div className="grid grid-cols-1 gap-3.5">
                    
                    {/* Probabilidad del Rango */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                      <div className="flex flex-col">
                        <span className="technical-caption text-white">Probabilidad Intervalo</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{probType}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-normal font-mono text-white">
                          Sim: <span className="font-bold">{(simResults.simulatedProbability * 100).toFixed(precision)}%</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          Teo: {(simResults.theoreticalProbability * 100).toFixed(precision)}%
                        </div>
                      </div>
                    </div>

                    {/* Media */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Promedio</span>
                      <div className="text-right">
                        <div className="text-sm font-normal font-mono text-white">
                          Sim: {simResults.simulatedMean.toFixed(precision)}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          Teo: {simResults.theoreticalMean.toFixed(precision)}
                        </div>
                      </div>
                    </div>

                    {/* Varianza */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Varianza</span>
                      <div className="text-right">
                        <div className="text-sm font-normal font-mono text-white">
                          Sim: {simResults.simulatedVariance.toFixed(precision)}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          Teo: {simResults.theoreticalVariance.toFixed(precision)}
                        </div>
                      </div>
                    </div>

                    {/* Desviación Estándar */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Desv. Est.</span>
                      <div className="text-right">
                        <div className="text-sm font-normal font-mono text-white">
                          Sim: {simResults.simulatedStdDev.toFixed(precision)}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          Teo: {simResults.theoreticalStdDev.toFixed(precision)}
                        </div>
                      </div>
                    </div>

                    {/* Intervalo de Confianza */}
                    <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">I.C. Media (95%)</span>
                        <span className="text-[9px] text-zinc-600 font-mono">Convergencia muestral</span>
                      </div>
                      <span className="text-xs font-normal font-mono text-zinc-200">
                        [{simResults.confidenceInterval[0].toFixed(precision)}, {simResults.confidenceInterval[1].toFixed(precision)}]
                      </span>
                    </div>

                    {/* Diferencia porcentual relativa en probabilidad */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Error Abs. Prob.</span>
                      <span className="text-sm font-normal font-mono text-white">
                        {(Math.abs(simResults.simulatedProbability - simResults.theoreticalProbability) * 100).toFixed(precision)}%
                      </span>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Botón Generar Gráfica */}
              <Button 
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-xl font-mono uppercase tracking-[0.2em] text-xs h-16 transition-all duration-500 shrink-0"
                onClick={handleGenerateGraph}
              >
                Visualizar Histograma
              </Button>

            </div>
          )}
        </div>

      </div>

      {/* Bloque Gráfico de Histograma Comparativo */}
      {showGraph && simResults && (
        <div 
          ref={graphRef}
          className={cn(
            "mx-auto max-w-[920px] w-full mt-6",
            shouldRunEntryAnimations && "animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
          )}
        >
          <Card className="bg-zinc-900 border-zinc-800 text-white rounded-xl overflow-hidden min-h-[390px] sm:min-h-[500px] flex flex-col relative">
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
              <CardTitle className="text-sm font-normal flex items-center gap-2 font-mono text-white uppercase tracking-wider leading-snug">
                <BarChart3 className="w-4 h-4 text-zinc-500 shrink-0" />
                Histograma de Frecuencia y Curva Teórica
              </CardTitle>
              <CardDescription className="card-description-copy">
                Frecuencia observada (barras blancas) vs. Probabilidad teórica (línea gris/puntos) para cada intervalo/valor.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow p-3 pt-6 sm:p-6 sm:pt-10 h-[320px] sm:h-[380px]">
              <ChartContainer config={chartConfig} className="w-full h-full min-h-0 aspect-auto [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-800/50">
                <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="binLabel" 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ 
                      value: calcDistType === "Poisson" ? "Valor discreto (k)" : "Intervalos de clase (x)", 
                      position: 'insideBottom', 
                      offset: -10, 
                      fill: '#71717a', 
                      fontSize: 10, 
                      fontFamily: 'monospace' 
                    }}
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
                        labelClassName="text-black font-bold font-mono"
                        formatter={(value, name) => {
                          const numVal = typeof value === 'number' ? value : Number(value);
                          if (name === "percentage") {
                            return [`${(numVal * 100).toFixed(3)}%`, "Muestra Sim."];
                          }
                          if (name === "theoreticalProb") {
                            return [`${(numVal * 100).toFixed(3)}%`, "Teórica"];
                          }
                          return [numVal, name];
                        }}
                      />
                    }
                  />
                  
                  {/* Barras del Histograma Simulado */}
                  <Bar 
                    dataKey="percentage" 
                    fill="#ffffff" 
                    name="Simulado" 
                    radius={[2, 2, 0, 0]}
                  />

                  {/* Línea de la Distribución Teórica */}
                  <Line 
                    type="monotone" 
                    dataKey="theoreticalProb" 
                    stroke="#8a8a93" 
                    strokeWidth={2}
                    dot={{ fill: '#8a8a93', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Teórico"
                  />
                </ComposedChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
