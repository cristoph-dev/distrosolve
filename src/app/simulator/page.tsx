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
import {
  calculateProbability, 
  poisson, 
  exponential,
  ProbType 
} from '@/lib/distributions';
import { Info, Hash, Check, ChevronsUpDown, ChevronLeft, ChevronRight, Sigma, HelpCircle, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import GlossaryPopoverLink from '@/components/GlossaryPopoverLink';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
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
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Cell
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

const chartConfig = {
  prob: {
    label: "Probabilidad",
    color: "#ffffff",
  },
  accum: {
    label: "Acumulada",
    color: "#a1a1aa",
  },
} satisfies ChartConfig;

type SimulatorValues = {
  distType: DistributionType;
  param: number;
  probType: ProbType;
  xi: number;
  xj: number;
};

export default function SimulatorPage() {
  useEffect(() => {
    document.title = "Simulador de distribuciones | distrosolve";
  }, []);

  const [hasVisited, setHasVisited] = useSessionState("simulator:hasVisited", false);
  const [shouldRunEntryAnimations] = useState(() => !hasVisited);

  useEffect(() => {
    if (!hasVisited) {
      setHasVisited(true);
    }
  }, [hasVisited, setHasVisited]);

  // --- Estado ---
  const [distType, setDistType] = useSessionState<DistributionType>("simulator:distType", "Poisson");
  const [openDist, setOpenDist] = useState(false);
  
  const [param, setParam] = useSessionState<number>("simulator:param", 5);
  const [xi, setXi] = useSessionState<number>("simulator:xi", 2);
  const [xj, setXj] = useSessionState<number>("simulator:xj", 4);
  const [probType, setProbType] = useSessionState<ProbType>("simulator:probType", "P(X <= xi)");
  const [openProb, setOpenProb] = useState(false);
  const [precision, setPrecision] = useSessionState<number>("simulator:precision", 4);

  // Estado para saber si se ha realizado al menos un cálculo
  const [hasCalculated, setHasCalculated] = useSessionState("simulator:hasCalculated", false);
  
  // Estado para mostrar la gráfica
  const [showGraph, setShowGraph] = useSessionState("simulator:showGraph", false);
  const [hasScrolled, setHasScrolled] = useSessionState("simulator:hasScrolled", false);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  // Estado para capturar los valores "congelados" en el momento del cálculo (Cuadro 2)
  const [calculatedValues, setCalculatedValues] = useSessionState<SimulatorValues>("simulator:calculatedValues", {
    distType: "Poisson",
    param: 5,
    probType: "P(X <= xi)" as ProbType,
    xi: 2,
    xj: 4
  });

  // Estado específico para la GRÁFICA (solo se actualiza al darle a "Generar Gráfica")
  const [graphValues, setGraphValues] = useSessionState<SimulatorValues>("simulator:graphValues", {
    distType: "Poisson",
    param: 5,
    probType: "P(X <= xi)" as ProbType,
    xi: 2,
    xj: 4
  });

  // Efecto para hacer scroll a la gráfica cuando aparece
  useEffect(() => {
    if (showGraph && graphRef.current && !isGraphLoading && !hasScrolled) {
      setTimeout(() => {
        graphRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setHasScrolled(true);
      }, 100);
    }
  }, [showGraph, isGraphLoading, hasScrolled, setHasScrolled]);

  // --- Cálculos (Usando solo los valores congelados del cálculo) ---
  const stats = useMemo(() => {
    const baseStats = calculatedValues.distType === "Poisson" 
      ? poisson.getStats(calculatedValues.param) 
      : exponential.getStats(calculatedValues.param);
    
    const pointProbability = calculatedValues.distType === "Poisson"
      ? poisson.pmf(calculatedValues.xi, calculatedValues.param)
      : exponential.pdf(calculatedValues.xi, calculatedValues.param);

    return {
      ...baseStats,
      pointProbability
    };
  }, [calculatedValues]);

  const probability = useMemo(() => {
    return calculateProbability(
      calculatedValues.distType, 
      calculatedValues.param, 
      calculatedValues.probType, 
      calculatedValues.xi, 
      calculatedValues.xj
    );
  }, [calculatedValues]);

  // --- Generación de Datos para la Gráfica (Usando graphValues) ---
  const chartData = useMemo(() => {
    const data = [];
    const { distType, param, probType, xi, xj } = graphValues;
    const isDiscrete = distType === "Poisson";

    const isPointInRange = (x: number) => {
      if (isDiscrete) {
        switch (probType) {
          case "P(X > xi)": return x > xi;
          case "P(X < xi)": return x < xi;
          case "P(X >= xi)": return x >= xi;
          case "P(X <= xi)": return x <= xi;
          case "P(X = xi)": return x === xi;
          case "P(xi < X < xj)": return x > xi && x < xj;
          case "P(xi <= X <= xj)": return x >= xi && x <= xj;
          case "P(xi <= X < xj)": return x >= xi && x < xj;
          case "P(xi < X <= xj)": return x > xi && x <= xj;
          default: return false;
        }
      } else {
        switch (probType) {
          case "P(X > xi)":
          case "P(X >= xi)": return x >= xi;
          case "P(X < xi)":
          case "P(X <= xi)": return x <= xi;
          case "P(X = xi)": return Math.abs(x - xi) < 0.05;
          case "P(xi < X < xj)":
          case "P(xi <= X <= xj)":
          case "P(xi <= X < xj)":
          case "P(xi < X <= xj)": return x >= xi && x <= xj;
          default: return false;
        }
      }
    };

    if (isDiscrete) {
      const mu = param;
      const sigma = Math.sqrt(mu);
      const maxX = Math.max(12, Math.ceil(mu + 4 * sigma), xj + 2);
      
      for (let k = 0; k <= maxX; k++) {
        data.push({
          x: k,
          prob: poisson.pmf(k, mu),
          accum: poisson.cdf(k, mu),
          inRange: isPointInRange(k)
        });
      }
    } else {
      const lambd = param;
      const maxX = Math.max(5 / lambd, xj + 1);
      const step = maxX / 100;
      
      for (let i = 0; i <= 100; i++) {
        const x = i * step;
        data.push({
          x: Number(x.toFixed(3)),
          prob: exponential.pdf(x, lambd),
          accum: exponential.cdf(x, lambd),
          inRange: isPointInRange(x)
        });
      }
    }
    return data;
  }, [graphValues]);

  const handleCalculate = () => {
    setCalculatedValues({
      distType,
      param,
      probType: probType as ProbType,
      xi,
      xj
    });
    setHasCalculated(true);
  };

  const handleGenerateGraph = () => {
    setHasScrolled(false);
    setIsGraphLoading(true);
    setShowGraph(true);
    
    // Simulamos un retraso para la animación de carga y sincronizamos los datos
    setTimeout(() => {
      setGraphValues({
        distType,
        param,
        probType: probType as ProbType,
        xi,
        xj
      });
      setIsGraphLoading(false);
    }, 800);
  };

  const placeholderProbability = `0.${'0'.repeat(precision)}%`;

  return (
    <div className="p-4 md:p-6 space-y-6 mx-auto w-full transition-all duration-700 pb-24">
      <div className={cn(
        "flex flex-col space-y-4 mb-6 mx-auto transition-all duration-1000 ease-in-out",
        hasCalculated ? "max-w-[920px]" : "max-w-md"
      )}>
        <div className="flex items-center text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">
          <span>distribuciones</span>
          <span className="mx-2 text-zinc-800">/</span>
          <span className="text-zinc-300">simulador</span>
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-white font-mono">
          Simulador de distribuciones
        </h1>
      </div>

      <div className={cn(
        "flex flex-col md:flex-row justify-start items-stretch gap-6 md:gap-0 transition-all duration-1000 ease-in-out mx-auto",
        hasCalculated ? "max-w-[920px]" : "max-w-md"
      )}>
        
        {/* Wrapper Cuadro 1 */}
        <div className={cn(
          "w-full max-w-md transition-all duration-1000 ease-in-out shrink-0",
          hasCalculated ? "md:mr-6 overflow-visible" : "overflow-hidden"
        )}>
          {/* Cuadro 1: Cálculo completo (Config + Prob) */}
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
                    <h4 className="font-mono text-xs uppercase tracking-wider text-white">Cálculo de Distribución</h4>
                    <p className="popover-copy">
                      Este módulo permite calcular probabilidades específicas para distribuciones discretas (Poisson) y continuas (Exponencial). Configura los parámetros y define el rango de interés.
                    </p>
                    <GlossaryPopoverLink href={distType === "Poisson" ? "/glossary#poisson" : "/glossary#exponencial"} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <CardHeader className="pb-3 flex flex-col items-start text-left">
              <CardTitle className="text-sm font-normal flex items-center justify-start gap-2 font-mono text-white">
                <Hash className="w-4 h-4 text-zinc-500" />
                Cálculo de distribución
              </CardTitle>
              <CardDescription className="card-description-copy">
                Configura los parámetros y obtén resultados precisos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow pt-4 pb-0 overflow-visible">
              {/* Sección Configuración */}
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
                <div className="space-y-2 flex flex-col items-start">
                  <div className="flex items-center justify-start gap-1.5 h-4">
                    <Label htmlFor="param" className="technical-label text-white uppercase whitespace-nowrap">
                      {distType === "Poisson" ? (
                        <>Promedio de eventos (<span className="normal-case">μ</span>)</>
                      ) : (
                        <>Tasa (<span className="normal-case">λ</span>)</>
                      )}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline-help-icon" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {distType === "Poisson" ? "Mu (Promedio de ocurrencias)" : "Lambda (Tasa de frecuencia)"}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-1 w-full justify-center">
                    <Input 
                      id="param" 
                      type="number" 
                      step="0.1"
                      min="0.1"
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
                      onClick={() => setParam(Number((param + 0.1).toFixed(1)))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sección Tipo de Intervalo */}
              <div className="space-y-2 flex flex-col items-start">
                <Label className="technical-label text-white mb-1">Tipo de Intervalo</Label>
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

              {/* Sección xi y xj */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col items-start">
                  <div className="flex items-center justify-start gap-1.5">
                    <Label className="technical-label text-white lowercase">xi</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline-help-icon" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        Límite inferior del intervalo
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
                        Límite superior del intervalo
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

              <Button 
                className="w-full bg-white text-black hover:bg-zinc-200 rounded-none font-mono uppercase tracking-widest text-xs h-12"
                onClick={handleCalculate}
              >
                Calcular Probabilidad
              </Button>

              {/* Resultado Final Integrado */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-none flex flex-col items-center overflow-hidden">
                <div className="p-3 flex flex-col items-center w-full bg-zinc-950">
                  <span className="technical-caption text-zinc-500 block mb-1">Probabilidad resultante</span>
                  <span className="text-3xl font-normal text-white font-mono">
                    {hasCalculated 
                      ? precision > 0 
                        ? `${(probability * 100).toFixed(precision)}%` 
                        : `${Math.round(probability * 100)}%`
                      : placeholderProbability}
                  </span>
                </div>
                
                <div className="flex flex-col items-center space-y-1 border-t border-zinc-800 py-3 w-full bg-zinc-900/30">
                  <span className="technical-caption text-zinc-500">Ajuste de precisión</span>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wrapper Columna 2 (Animado) */}
        <div className={cn(
          "transition-all duration-700 ease-in-out shrink-0 flex flex-col",
          hasCalculated ? "w-full max-w-md opacity-100 overflow-visible" : "w-0 opacity-0 pointer-events-none overflow-hidden"
        )}>
          <div className="w-full h-full flex flex-col gap-6">
            {/* Cuadro 2: Estadísticos */}
            <Card 
              key={`stats-${JSON.stringify(calculatedValues)}`}
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
                      <h4 className="font-mono text-xs uppercase tracking-wider text-white">Propiedades Estadísticas</h4>
                      <p className="popover-copy">
                        Aquí se muestran las características matemáticas de la distribución actual, como el promedio, la variancia y la probabilidad puntual según los parámetros ingresados.
                      </p>
                      <GlossaryPopoverLink href="/glossary#estadisticos" />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal flex items-center gap-2 font-mono text-white">
                  <Sigma className="w-4 h-4 text-zinc-500" />
                  Propiedades estadísticas
                </CardTitle>
                <CardDescription className="card-description-copy">
                  Análisis matemático de la distribución.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-start pt-2">
                <div className="grid grid-cols-1 gap-4">
                  {/* Item especial: Probabilidad puntual */}
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-2 relative group">
                    <div className="flex flex-col relative">
                      <div className="flex items-center gap-2">
                        <span className="technical-caption text-white">
                          {calculatedValues.distType === "Poisson" ? "Probabilidad Discreta" : "Densidad Prob."}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">P(X = xi)</span>
                    </div>

                    <span className="text-xl font-normal font-mono text-white">
                      {precision > 0 
                        ? `${(stats.pointProbability * 100).toFixed(precision)}%` 
                        : `${Math.round(stats.pointProbability * 100)}%`}
                    </span>
                  </div>

                  {[
                    { label: 'Promedio', value: stats.Promedio },
                    { label: 'Variancia', value: stats.Variancia },
                    { label: 'Desv. Est.', value: stats.Desviacion_Est, tooltip: 'Desviación Estándar' },
                    { label: 'Asimetría', value: stats.Asimetria },
                    { label: 'Curtosis', value: stats.Curtosis },
                    { label: 'Coef. Variación', value: stats.Coef_Variacion, tooltip: 'Coeficiente de Variación' }
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between border-b border-zinc-800/50 pb-2 last:border-0 relative group">
                      <div className="relative flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{stat.label}</span>
                        
                        {/* Tooltip */}
                        {stat.tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {stat.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      <span className="text-xl font-normal font-mono text-white">{stat.value.toFixed(precision)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botón Generar Gráfica (Bloque Blanco) */}
            <Button 
              key={`btn-${JSON.stringify(calculatedValues)}`}
              className={cn(
                "w-full bg-white text-black hover:bg-zinc-200 rounded-xl font-mono uppercase tracking-[0.2em] text-xs h-16 transition-all duration-500 shrink-0",
                shouldRunEntryAnimations && "animate-in fade-in duration-1000 delay-150"
              )}
              onClick={handleGenerateGraph}
            >
              Generar Gráfica
            </Button>
          </div>
        </div>
      </div>

      {/* Bloque de Gráfica (Aparece abajo) */}
      {showGraph && (
        <div 
          ref={graphRef}
          className={cn(
            "mx-auto mt-6 w-full max-w-full md:w-[920px]",
            shouldRunEntryAnimations && "animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
          )}
        >
          <Card className="bg-zinc-900 border-zinc-800 text-white rounded-xl overflow-hidden min-h-[360px] sm:min-h-[430px] flex flex-col relative w-full">
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

            <Tabs defaultValue="prob" className="w-full flex flex-col h-full">
              <CardHeader className="border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 space-y-0">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-sm font-normal flex items-center gap-2 font-mono text-white uppercase tracking-wider leading-snug">
                    <BarChart3 className="w-4 h-4 text-zinc-500 shrink-0" />
                    Visualización de la Distribución
                  </CardTitle>
                  <CardDescription className="card-description-copy">
                    Representación de {graphValues.distType} con {graphValues.distType === "Poisson" ? "μ" : "λ"} = {graphValues.param}.
                  </CardDescription>
                </div>
                <TabsList className="bg-zinc-950 border border-zinc-800 h-9 p-1 rounded-lg w-full sm:w-auto">
                  <TabsTrigger 
                    value="prob" 
                    className="flex-1 sm:flex-none text-[11px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-colors h-7"
                  >
                    Masa/Densidad
                  </TabsTrigger>
                  <TabsTrigger 
                    value="accum" 
                    className="flex-1 sm:flex-none text-[11px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white transition-colors h-7"
                  >
                    Acumulada
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="flex-grow p-3 pt-6 sm:p-6 sm:pt-8 h-[290px] sm:h-[340px]">
                <ChartContainer config={chartConfig} className="w-full h-full min-h-0 aspect-auto [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-zinc-800/50">
                  <TabsContent value="prob" className="m-0 w-full h-full">
                    {graphValues.distType === "Poisson" ? (
                      <BarChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="x" 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          label={{ value: 'x (Eventos)', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              indicator="line"
                              labelClassName="text-black font-bold"
                              className="w-[150px]"
                            />
                          } 
                        />
                        <Bar 
                          dataKey="prob" 
                          name="Probabilidad" 
                          radius={[4, 4, 0, 0]}
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.inRange ? "#ffffff" : "#27272a"} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 20 }}>
                        <defs>
                          <linearGradient id="fillProb" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="x" 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          label={{ value: 'x', position: 'insideBottom', offset: -10, fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              indicator="line"
                              labelClassName="text-black font-bold"
                              className="w-[150px]"
                            />
                          } 
                        />
                        <Area
                          type="monotone"
                          dataKey="prob"
                          name="Densidad"
                          stroke="#ffffff"
                          fill="transparent"
                        />
                        <Area
                          type="monotone"
                          dataKey="prob"
                          stroke="none"
                          fill="url(#fillProb)"
                          connectNulls
                          baseValue={0}
                          data={chartData.map(d => ({ ...d, prob: d.inRange ? d.prob : null }))}
                        />
                      </AreaChart>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="accum" className="m-0 w-full h-full">
                    {graphValues.distType === "Poisson" ? (
                      <LineChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="x" 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              indicator="line"
                              labelClassName="text-black font-bold"
                              className="w-[150px]"
                            />
                          } 
                        />
                        <Line 
                          type="stepAfter" 
                          dataKey="accum" 
                          name="Acumulada" 
                          stroke="#ffffff" 
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#ffffff", strokeWidth: 0 }}
                          activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 20 }}>
                        <defs>
                          <linearGradient id="fillAccum" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="x" 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                        />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              indicator="line"
                              labelClassName="text-black font-bold"
                              className="w-[150px]"
                            />
                          } 
                        />
                        <Area
                          type="monotone"
                          dataKey="accum"
                          name="Acumulada"
                          stroke="#ffffff"
                          fill="url(#fillAccum)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    )}
                  </TabsContent>
                </ChartContainer>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}

