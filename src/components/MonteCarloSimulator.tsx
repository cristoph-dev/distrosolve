"use client";

import { useMemo, useState } from "react";
import { BarChart3, ChevronLeft, ChevronRight, Database, Download, FileText, HelpCircle, Info, Play, Sigma } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import GlossaryPopoverLink from "@/components/GlossaryPopoverLink";
import { generateHistogramData, generateMonteCarloDataset, MonteCarloDataset, MonteCarloDistribution } from "@/lib/montecarlo";
import { cn } from "@/lib/utils";

const chartConfig = {
  percentage: { label: "Frecuencia relativa", color: "#ffffff" },
  theoreticalProb: { label: "Probabilidad teórica", color: "#71717a" },
} satisfies ChartConfig;

const MAX_VARIABLES = 20;
const MAX_OBSERVATIONS = 10000;

export default function MonteCarloSimulator() {
  const [distribution, setDistribution] = useState<MonteCarloDistribution>("Poisson");
  const [parameter, setParameter] = useState(5);
  const [variableCount, setVariableCount] = useState(2);
  const [observationCount, setObservationCount] = useState(100);
  const [selectedVariable, setSelectedVariable] = useState(0);
  const [dataset, setDataset] = useState<MonteCarloDataset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const histogram = useMemo(() => dataset ? generateHistogramData(
    dataset.rows.map((row) => row[selectedVariable]), distribution, parameter
  ) : [], [dataset, distribution, parameter, selectedVariable]);

  function simulate() {
    if (variableCount > MAX_VARIABLES || observationCount > MAX_OBSERVATIONS) {
      setError(`Use como máximo ${MAX_VARIABLES} variables y ${MAX_OBSERVATIONS.toLocaleString("es-VE")} observaciones.`);
      return;
    }
    try {
      setDataset(generateMonteCarloDataset(distribution, parameter, variableCount, observationCount));
      setSelectedVariable(0);
      setError(null);
    } catch (simulationError) {
      setError(simulationError instanceof Error ? simulationError.message : "No fue posible ejecutar la simulación.");
    }
  }

  function downloadCsv() {
    if (!dataset) return;
    const header = ["Observación", ...dataset.summaries.map((item) => item.variable)];
    const body = dataset.rows.map((row, index) => [index + 1, ...row].join(","));
    const url = URL.createObjectURL(new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `montecarlo-${distribution.toLowerCase()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    if (!dataset) return;
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      setError("El navegador bloqueó la ventana del PDF. Permita las ventanas emergentes e inténtelo nuevamente.");
      return;
    }

    const summaryRows = dataset.summaries.map((item) => `
      <tr><td>${item.variable}</td><td>${format(item.mean)}</td><td>${format(item.variance)}</td><td>${format(item.standardDeviation)}</td><td>${format(item.minimum)}</td><td>${format(item.maximum)}</td></tr>
    `).join("");
    const dataRows = dataset.rows.map((row, index) => `
      <tr><td>${index + 1}</td>${row.map((value) => `<td>${distribution === "Poisson" ? value : format(value)}</td>`).join("")}</tr>
    `).join("");
    const variableHeaders = dataset.summaries.map((item) => `<th>${item.variable}</th>`).join("");

    reportWindow.opener = null;
    reportWindow.document.title = `Monte Carlo - ${distribution}`;
    reportWindow.document.documentElement.innerHTML = `
      <head><meta charset="utf-8"><title>Monte Carlo - ${distribution}</title><style>
        @page { size: landscape; margin: 12mm; }
        body { color: #18181b; font-family: Arial, sans-serif; font-size: 10px; }
        h1 { font-family: monospace; font-size: 18px; margin: 0 0 6px; }
        p { color: #52525b; margin: 0 0 16px; }
        h2 { font-family: monospace; font-size: 12px; margin: 18px 0 8px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #d4d4d8; padding: 5px 7px; text-align: right; }
        th { background: #f4f4f5; font-family: monospace; }
        th:first-child, td:first-child { text-align: left; }
        .data { page-break-before: always; }
      </style></head><body>
        <h1>Simulación de Monte Carlo</h1>
        <p>Distribución: ${distribution} · λ: ${parameter} · Variables: ${dataset.summaries.length} · Observaciones: ${dataset.rows.length}</p>
        <h2>Resumen estadístico</h2>
        <table><thead><tr><th>Variable</th><th>Media</th><th>Varianza</th><th>Desv. est.</th><th>Mínimo</th><th>Máximo</th></tr></thead><tbody>${summaryRows}</tbody></table>
        <section class="data"><h2>Base de datos simulada</h2><table><thead><tr><th>Observación</th>${variableHeaders}</tr></thead><tbody>${dataRows}</tbody></table></section>
      </body>`;
    reportWindow.document.close();
    window.setTimeout(() => {
      reportWindow.focus();
      reportWindow.print();
    }, 250);
  }

  return <div className="space-y-6">
    <Card className="relative animate-in fade-in slide-in-from-bottom-4 rounded-xl border-zinc-800 bg-zinc-900 text-white duration-700 ease-out">
      <div className="absolute top-3 right-3">
        <Popover>
          <PopoverTrigger asChild><Button variant="ghost" size="icon" className="bento-info-trigger"><Info className="bento-info-icon" /></Button></PopoverTrigger>
          <PopoverContent side="top" align="end" className="w-80 border-zinc-800 bg-zinc-900 text-zinc-300">
            <div className="space-y-3">
              <h4 className="font-mono text-xs uppercase tracking-wider text-white">Simulación de Monte Carlo</h4>
              <p className="popover-copy">Genera variables aleatorias independientes para construir una base de datos y comparar sus estadísticos muestrales con los valores teóricos.</p>
              <GlossaryPopoverLink href="/glossary#monte-carlo" />
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-mono text-sm font-normal"><Database className="h-4 w-4 text-zinc-400" /> Configuración de la base de datos</CardTitle>
        <CardDescription className="card-description-copy">Cada variable genera una columna independiente; las observaciones determinan la cantidad de filas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="font-mono text-[11px] text-zinc-400">Distribución</Label>
            <div className="grid grid-cols-2 border border-zinc-700 bg-zinc-950 p-1">
              {(["Poisson", "Exponencial"] as const).map((item) => <button key={item} type="button" onClick={() => { setDistribution(item); setDataset(null); }} className={cn("h-8 cursor-pointer font-mono text-[11px] transition-colors", distribution === item ? "bg-white text-black" : "text-zinc-400 hover:text-white")}>{item}</button>)}
            </div>
          </div>
          <NumberField label={distribution === "Poisson" ? "Media (λ)" : "Tasa (λ)"} value={parameter} min={0.01} step={0.01} onChange={setParameter} />
          <NumberField label="Cantidad de variables" value={variableCount} min={1} max={MAX_VARIABLES} step={1} onChange={setVariableCount} />
          <NumberField label="Cantidad de observaciones" value={observationCount} min={1} max={MAX_OBSERVATIONS} step={1} onChange={setObservationCount} />
        </div>
        <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-zinc-500">Se generarán {variableCount * observationCount || 0} datos aleatorios.</p>
          <Button onClick={simulate} className="cursor-pointer rounded-md bg-white font-mono text-xs text-black hover:bg-zinc-200"><Play className="h-3.5 w-3.5" /> Ejecutar simulación</Button>
        </div>
        {error && <p role="alert" className="border border-zinc-700 bg-zinc-950 px-3 py-2 text-[13px] text-zinc-300">{error}</p>}
      </CardContent>
    </Card>

    {dataset && <>
      <Card className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border-zinc-800 bg-zinc-900 text-white duration-700 ease-out">
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div><CardTitle className="flex items-center gap-2 font-mono text-sm font-normal"><Sigma className="h-4 w-4 text-zinc-400" /> Resumen estadístico</CardTitle><CardDescription className="card-description-copy">Comparación de cada muestra con los valores teóricos.</CardDescription></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadCsv} className="cursor-pointer border-zinc-700 bg-transparent font-mono text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white"><Download className="h-3.5 w-3.5" /> CSV</Button>
            <Button variant="outline" onClick={downloadPdf} className="cursor-pointer border-zinc-700 bg-transparent font-mono text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white"><FileText className="h-3.5 w-3.5" /> PDF</Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto"><SummaryTable dataset={dataset} /></CardContent>
      </Card>

      <Tabs defaultValue="data" className="animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-700 ease-out">
        <TabsList className="h-8 w-fit rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
          <TabsTrigger value="data" className="h-7 flex-none px-2.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Base de datos</TabsTrigger>
          <TabsTrigger value="chart" className="h-7 flex-none px-2.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Histograma</TabsTrigger>
        </TabsList>
        <TabsContent value="data" className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out"><DataTable dataset={dataset} distribution={distribution} /></TabsContent>
        <TabsContent value="chart" className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
          <Card className="rounded-xl border-zinc-800 bg-zinc-900 text-white"><CardHeader><CardTitle className="flex items-center gap-2 font-mono text-sm font-normal"><BarChart3 className="h-4 w-4 text-zinc-400" /> Distribución observada</CardTitle><div className="flex flex-wrap gap-2 pt-2">{dataset.summaries.map((item, index) => <button key={item.variable} type="button" onClick={() => setSelectedVariable(index)} className={cn("cursor-pointer border px-3 py-1.5 font-mono text-[11px]", selectedVariable === index ? "border-white bg-white text-black" : "border-zinc-700 text-zinc-400")}>{item.variable}</button>)}</div></CardHeader>
            <CardContent><ChartContainer config={chartConfig} className="h-[320px] w-full"><BarChart data={histogram} accessibilityLayer><CartesianGrid vertical={false} stroke="#27272a" /><XAxis dataKey="binLabel" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(value) => `${Math.round(value * 100)}%`} /><ChartTooltip content={<ChartTooltipContent formatter={(value) => `${(Number(value) * 100).toFixed(2)}%`} />} /><Bar dataKey="theoreticalProb" fill="#52525b" radius={2} /><Bar dataKey="percentage" fill="#ffffff" radius={2} /></BarChart></ChartContainer></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>}
  </div>;
}

function NumberField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (value: number) => void; min: number; max?: number; step: number }) {
  const adjust = (direction: -1 | 1) => {
    const current = Number.isFinite(value) ? value : min;
    const decimals = step.toString().split(".")[1]?.length ?? 0;
    const next = Number((current + direction * step).toFixed(decimals));
    onChange(Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min, next)));
  };

  return <div className="space-y-2">
    <Label className="font-mono text-[11px] text-zinc-400">{label}</Label>
    <div className="flex w-full items-center gap-1">
      <Input type="number" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} className="h-10 min-w-0 flex-1 rounded-none border-zinc-700 bg-zinc-950 text-center font-mono text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
      <Button type="button" variant="outline" size="icon" onClick={() => adjust(-1)} disabled={value <= min} aria-label={`Disminuir ${label}`} className="h-10 w-10 shrink-0 cursor-pointer rounded-none border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></Button>
      <Button type="button" variant="outline" size="icon" onClick={() => adjust(1)} disabled={max !== undefined && value >= max} aria-label={`Aumentar ${label}`} className="h-10 w-10 shrink-0 cursor-pointer rounded-none border-zinc-700 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></Button>
    </div>
  </div>;
}

function SummaryTable({ dataset }: { dataset: MonteCarloDataset }) {
  const headings = [
    { label: "Variable", help: "Columna independiente generada durante la simulación" },
    { label: "Media", help: "Promedio aritmético de los valores simulados" },
    { label: "Varianza", help: "Dispersión muestral de los valores respecto a su media" },
    { label: "Desv. est.", help: "Raíz cuadrada de la varianza muestral" },
    { label: "Mínimo", help: "Menor valor observado en la variable simulada" },
    { label: "Máximo", help: "Mayor valor observado en la variable simulada" },
  ];
  return <table className="w-full min-w-[680px] border-collapse text-left"><thead className="font-mono text-[10px] uppercase tracking-wider text-zinc-500"><tr>{headings.map((heading) => <th key={heading.label} className="border-b border-zinc-800 px-3 py-2 font-normal"><span className="inline-flex items-center gap-1.5">{heading.label}<Tooltip><TooltipTrigger asChild><HelpCircle className="inline-help-icon" /></TooltipTrigger><TooltipContent side="right">{heading.help}</TooltipContent></Tooltip></span></th>)}</tr></thead><tbody className="font-mono text-xs text-zinc-300">{dataset.summaries.map((item) => <tr key={item.variable} className="border-b border-zinc-800/70"><td className="px-3 py-3 text-white">{item.variable}</td><td className="px-3 py-3">{format(item.mean)}</td><td className="px-3 py-3">{format(item.variance)}</td><td className="px-3 py-3">{format(item.standardDeviation)}</td><td className="px-3 py-3">{format(item.minimum)}</td><td className="px-3 py-3">{format(item.maximum)}</td></tr>)}<tr className="bg-zinc-950 text-zinc-400"><td className="px-3 py-3">Valor teórico</td><td className="px-3 py-3">{format(dataset.theoreticalMean)}</td><td className="px-3 py-3">{format(dataset.theoreticalVariance)}</td><td className="px-3 py-3">{format(Math.sqrt(dataset.theoreticalVariance))}</td><td colSpan={2} /></tr></tbody></table>;
}

function DataTable({ dataset, distribution }: { dataset: MonteCarloDataset; distribution: MonteCarloDistribution }) {
  return <Card className="rounded-xl border-zinc-800 bg-zinc-900 text-white"><CardContent className="max-h-[460px] overflow-auto p-0"><table className="w-full min-w-max border-collapse font-mono text-xs"><thead className="sticky top-0 bg-zinc-950 text-zinc-500"><tr><th className="border-r border-b border-zinc-800 px-4 py-3 text-left font-normal">Observación</th>{dataset.summaries.map((item) => <th key={item.variable} className="border-r border-b border-zinc-800 px-4 py-3 text-right font-normal last:border-r-0">{item.variable}</th>)}</tr></thead><tbody>{dataset.rows.map((row, rowIndex) => <tr key={rowIndex} className="border-b border-zinc-800/60 text-zinc-300"><td className="border-r border-zinc-800 px-4 py-2 text-zinc-500">{rowIndex + 1}</td>{row.map((value, columnIndex) => <td key={columnIndex} className="border-r border-zinc-800 px-4 py-2 text-right last:border-r-0">{distribution === "Poisson" ? value : format(value)}</td>)}</tr>)}</tbody></table></CardContent></Card>;
}

function format(value: number) {
  return Number.isFinite(value) ? value.toLocaleString("es-VE", { maximumFractionDigits: 4 }) : "--";
}
