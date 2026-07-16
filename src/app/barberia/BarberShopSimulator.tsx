"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Armchair,
  BarChart3,
  Clock3,
  Coffee,
  Download,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Scissors,
  Store,
  Users,
} from "lucide-react";

import {
  advanceBarberShopState,
  BarberClient,
  BarberShopConfig,
  BarberShopReport,
  BarberShopState,
  buildBarberShopReport,
  createBarberShopState,
  validateBarberShopConfig,
} from "@/lib/barbershop-simulation";

const DEFAULT_CONFIG: BarberShopConfig = {
  chairs: 3,
  limitedQueue: true,
  queueLimit: 6,
  lambda: 0.5,
  mu: 0.25,
};

function cloneState(state: BarberShopState): BarberShopState {
  return {
    ...state,
    config: { ...state.config },
    clients: state.clients.map((client) => ({ ...client })),
    servers: [...state.servers],
    stateDurations: { ...state.stateDurations },
  };
}

export default function BarberShopSimulator() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<"idle" | "running" | "stopped">("idle");
  const [snapshot, setSnapshot] = useState<BarberShopState | null>(null);
  const [report, setReport] = useState<BarberShopReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<BarberShopState | null>(null);

  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setInterval(() => {
      const engine = engineRef.current;
      if (!engine) return;
      advanceBarberShopState(engine, 0.25);
      setSnapshot(cloneState(engine));
    }, 250);
    return () => window.clearInterval(timer);
  }, [phase]);

  const waitingClients = useMemo(
    () => snapshot?.clients.filter((client) => client.status === "waiting") ?? [],
    [snapshot]
  );
  const recentClients = useMemo(
    () => snapshot?.clients.slice(-6).reverse() ?? [],
    [snapshot]
  );

  function startSimulation() {
    const validation = validateBarberShopConfig(config);
    if (validation) {
      setError(validation);
      return;
    }
    const engine = createBarberShopState(config);
    engineRef.current = engine;
    setSnapshot(cloneState(engine));
    setReport(null);
    setError(null);
    setPhase("running");
  }

  function stopSimulation() {
    const engine = engineRef.current;
    if (!engine) return;
    engine.running = false;
    setSnapshot(cloneState(engine));
    setReport(buildBarberShopReport(engine));
    setPhase("stopped");
  }

  function resetSimulation() {
    engineRef.current = null;
    setSnapshot(null);
    setReport(null);
    setError(null);
    setPhase("idle");
  }

  function downloadReport() {
    if (!report) return;
    const header = "cliente,estado,visito_barra,entre_llegadas,llegada,inicio_servicio,tiempo_servicio,salida,espera,sistema";
    const rows = report.records.map((client) => [
      client.id,
      client.status,
      client.visitedBar ? "si" : "no",
      fixed(client.interarrivalTime),
      fixed(client.arrivalTime),
      client.serviceStart === undefined ? "" : fixed(client.serviceStart),
      fixed(client.serviceTime),
      client.departureTime === undefined ? "" : fixed(client.departureTime),
      client.serviceStart === undefined ? "" : fixed(client.serviceStart - client.arrivalTime),
      client.departureTime === undefined ? "" : fixed(client.departureTime - client.arrivalTime),
    ].join(","));
    const url = URL.createObjectURL(new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reporte-barberia.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#0D0C0B_0%,#090807_48%,#000000_100%)] text-[#f5f2eb] selection:bg-[#d6b98c] selection:text-black">
      <header className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(30,24,19,0.96)_0%,rgba(18,16,14,0.88)_100%)] px-4 py-4 backdrop-blur md:px-7">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full border border-[#d6b98c]/50 bg-black/30"><Scissors className="h-5 w-5 text-[#d6b98c]" /></div>
            <div><h1 className="font-mono text-sm uppercase tracking-[0.2em]">Barbería / simulador</h1><p className="mt-1 text-xs text-white/45">Modelo de eventos discretos · vista cenital</p></div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/50">
            <span className={`h-2 w-2 rounded-full ${phase === "running" ? "animate-pulse bg-emerald-400" : "bg-white/25"}`} />
            {phase === "running" ? "Simulación activa" : phase === "stopped" ? "Reporte generado" : "Lista para iniciar"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 p-4 md:p-7 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="print:hidden">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#171411] shadow-2xl shadow-black/30">
            <div className="border-b border-white/10 p-5"><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d6b98c]">Configuración</p><h2 className="mt-2 text-xl font-medium">Operación del local</h2><p className="mt-2 text-xs leading-5 text-white/45">Unidad: minutos. Un segundo real equivale a un minuto simulado.</p></div>
            <div className="space-y-5 p-5">
              <Stepper label="Sillas / barberos" value={config.chairs} min={1} max={20} step={1} disabled={phase === "running"} onChange={(chairs) => setConfig({ ...config, chairs })} />
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-white/50">Capacidad de la cola</label>
                <div className="mt-2 grid grid-cols-2 rounded-lg border border-white/10 bg-black/20 p-1">
                  <button type="button" disabled={phase === "running"} onClick={() => setConfig({ ...config, limitedQueue: false })} className={`rounded-md px-3 py-2 font-mono text-[10px] uppercase transition ${!config.limitedQueue ? "bg-[#d6b98c] text-black" : "text-white/50 hover:text-white"}`}>Sin límite</button>
                  <button type="button" disabled={phase === "running"} onClick={() => setConfig({ ...config, limitedQueue: true })} className={`rounded-md px-3 py-2 font-mono text-[10px] uppercase transition ${config.limitedQueue ? "bg-[#d6b98c] text-black" : "text-white/50 hover:text-white"}`}>Con límite</button>
                </div>
              </div>
              {config.limitedQueue && <Stepper label="Límite de espera" value={config.queueLimit} min={0} max={100} step={1} disabled={phase === "running"} onChange={(queueLimit) => setConfig({ ...config, queueLimit })} />}
              <Stepper label="Llegadas λ (clientes/min)" value={config.lambda} min={0.01} max={10} step={0.05} disabled={phase === "running"} onChange={(lambda) => setConfig({ ...config, lambda })} />
              <Stepper label="Servicio μ (por silla/min)" value={config.mu} min={0.01} max={10} step={0.05} disabled={phase === "running"} onChange={(mu) => setConfig({ ...config, mu })} />
              <div className="rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-[10px] leading-5 text-white/45">
                Capacidad: {(config.chairs * config.mu).toFixed(2)} clientes/min<br />Carga teórica: {(config.lambda / (config.chairs * config.mu) * 100).toFixed(1)}%
              </div>
              {error && <p role="alert" className="rounded-lg border border-red-400/25 bg-red-950/20 p-3 text-xs text-red-200">{error}</p>}
              {phase === "idle" && <ActionButton onClick={startSimulation} icon={Play}>Iniciar simulación</ActionButton>}
              {phase === "running" && <ActionButton onClick={stopSimulation} icon={Pause} danger>Detener y reportar</ActionButton>}
              {phase === "stopped" && <div className="space-y-2"><div className="grid grid-cols-2 gap-2"><ActionButton onClick={startSimulation} icon={Play}>Nueva</ActionButton><ActionButton onClick={resetSimulation} icon={RotateCcw} secondary>Reiniciar</ActionButton></div><ActionButton onClick={() => window.print()} icon={Download}>Descargar PDF</ActionButton></div>}
            </div>
          </section>
        </aside>

        <div className="space-y-5">
          <LiveMetrics snapshot={snapshot} waiting={waitingClients.length} />
          <BarberShopScene snapshot={snapshot} waitingClients={waitingClients} recentClients={recentClients} configuredChairs={config.chairs} />
          {report && <Report report={report} config={config} onDownload={downloadReport} />}
        </div>
      </main>
    </div>
  );
}

function BarberShopScene({ snapshot, waitingClients, recentClients, configuredChairs }: { snapshot: BarberShopState | null; waitingClients: BarberClient[]; recentClients: BarberClient[]; configuredChairs: number }) {
  const chairs = snapshot?.servers ?? Array.from({ length: configuredChairs }, () => null);
  const clientsAtBar = waitingClients.filter((client) => client.atBar);
  const clientsInSeats = waitingClients.filter((client) => !client.atBar);
  return (
    <section className="print:hidden overflow-hidden rounded-2xl border border-white/10 bg-[#171411] shadow-2xl shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d6b98c]">Vista dron</p><h2 className="mt-1 text-lg font-medium">Escenografía general</h2></div><div className="font-mono text-xs text-white/45">{formatClock(snapshot?.clock ?? 0)}</div></div>
      <div className="relative min-h-[600px] overflow-hidden bg-[radial-gradient(circle_at_30%_10%,#3b3027_0%,#29231d_38%,#171411_100%)] p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative grid min-h-[550px] gap-4 lg:grid-cols-[1fr_240px]">
          <div className="grid gap-4 sm:grid-rows-[1fr_150px]">
            <div className="rounded-xl border-4 border-[#4a3b2d] bg-[linear-gradient(135deg,#211c17_25%,#272019_25%,#272019_50%,#211c17_50%,#211c17_75%,#272019_75%)] bg-[size:28px_28px] p-4 shadow-inner shadow-black/70">
              <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/55"><Armchair className="h-4 w-4" /> Área de sillas</span><span className="font-mono text-[10px] text-white/35">{chairs.length} estaciones</span></div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {chairs.map((clientId, index) => <BarberChair key={index} index={index} clientId={clientId} />)}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
              <div className="rounded-xl border border-white/10 bg-[#1b1815] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/55"><Users className="h-4 w-4" /> Área de espera <span className="ml-auto text-[#d6b98c]">{waitingClients.length}</span></div><div className="mt-4 flex min-h-16 flex-wrap content-start gap-2">{clientsInSeats.length ? clientsInSeats.slice(0, 18).map((client) => <ClientToken key={client.id} client={client} />) : <span className="text-xs text-white/25">Asientos disponibles</span>}</div></div>
              <div className="rounded-xl border border-white/10 bg-[#201914] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/55"><Coffee className="h-4 w-4" /> Barra <span className="ml-auto text-[#d6b98c]">{clientsAtBar.length}/4</span></div><div className="relative mt-4 flex h-14 items-center gap-2 rounded-md border border-[#d6b98c]/25 bg-[#5a4029] px-3 shadow-[inset_0_8px_16px_rgba(0,0,0,.35)]">{clientsAtBar.length ? clientsAtBar.map((client) => <div key={client.id} className="grid h-8 w-8 animate-in zoom-in place-items-center rounded-full border-2 border-[#ead7b8] bg-[#2d241c] font-mono text-[9px] text-white shadow-lg">{client.id}</div>) : <span className="font-mono text-[9px] uppercase tracking-wider text-white/25">Barra disponible</span>}</div><p className="mt-3 text-[10px] text-white/30">Los clientes conservan su posición en la cola.</p></div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-[180px_1fr]">
            <div className="rounded-xl border border-white/10 bg-[#181512] p-4"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/55"><Store className="h-4 w-4" /> Servicios</div><ul className="mt-4 space-y-2 text-xs text-white/45"><li className="flex justify-between border-b border-white/5 pb-2"><span>Corte clásico</span><Scissors className="h-3.5 w-3.5" /></li><li className="flex justify-between border-b border-white/5 pb-2"><span>Perfilado de barba</span><Scissors className="h-3.5 w-3.5" /></li><li className="flex justify-between"><span>Corte + barba</span><Scissors className="h-3.5 w-3.5" /></li></ul></div>
            <div className="rounded-xl border border-white/10 bg-black/25 p-4"><div className="font-mono text-[10px] uppercase tracking-wider text-white/55">Eventos recientes</div><div className="mt-3 space-y-2">{recentClients.length ? recentClients.map((client) => <div key={client.id} className="flex items-center justify-between border-b border-white/5 pb-2 font-mono text-[10px]"><span className="text-white/55">Cliente {client.id}</span><Status status={client.status} /></div>) : <p className="text-xs text-white/25">Inicie la simulación para recibir clientes.</p>}</div></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BarberChair({ index, clientId }: { index: number; clientId: number | null }) {
  return <div className={`relative min-h-24 rounded-lg border p-2 transition-all ${clientId ? "border-[#d6b98c]/70 bg-[#6b4a2f]/50 shadow-[0_0_20px_rgba(214,185,140,.12)]" : "border-white/10 bg-black/25"}`}><div className="mx-auto h-10 w-9 rounded-t-xl border-2 border-white/20 bg-[#111] shadow-lg" /><div className="mx-auto h-7 w-12 rounded-b-md border-x-2 border-b-2 border-white/15 bg-[#151515]" /><span className="absolute top-2 left-2 font-mono text-[9px] text-white/30">{index + 1}</span>{clientId && <span className="absolute right-2 bottom-2 rounded-full bg-[#d6b98c] px-2 py-1 font-mono text-[9px] text-black">C{clientId}</span>}</div>;
}

function ClientToken({ client }: { client: BarberClient }) {
  return <div title={`Cliente ${client.id}`} className="grid h-9 w-9 animate-in zoom-in place-items-center rounded-full border-2 border-[#d6b98c]/60 bg-[#403225] font-mono text-[9px] text-white shadow-lg">{client.id}</div>;
}

function LiveMetrics({ snapshot, waiting }: { snapshot: BarberShopState | null; waiting: number }) {
  const busy = snapshot?.servers.filter((id) => id !== null).length ?? 0;
  const accepted = snapshot?.accepted ?? 0;
  const rejected = snapshot?.rejected ?? 0;
  return <section className="print:hidden grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4"><LiveMetric label="Reloj simulado" value={formatClock(snapshot?.clock ?? 0)} icon={Clock3} /><LiveMetric label="Sillas activas" value={`${busy}/${snapshot?.servers.length ?? 0}`} icon={Armchair} /><LiveMetric label="Clientes en cola" value={String(waiting)} icon={Users} /><LiveMetric label="Admitidos / perdidos" value={`${accepted} / ${rejected}`} icon={BarChart3} /></section>;
}

function LiveMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock3 }) {
  return <div className="bg-[#171411] p-4"><div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-white/40"><Icon className="h-3.5 w-3.5" />{label}</div><div className="mt-2 font-mono text-xl text-white">{value}</div></div>;
}

function Report({ report, config, onDownload }: { report: BarberShopReport; config: BarberShopConfig; onDownload: () => void }) {
  const metrics = [
    ["Utilización", `${(report.utilization * 100).toFixed(2)}%`], ["Tiempo prom. cola", `${fixed(report.averageQueueTime)} min`],
    ["Tiempo prom. sistema", `${fixed(report.averageSystemTime)} min`], ["Clientes prom. cola", fixed(report.averageQueueLength)],
    ["Clientes prom. sistema", fixed(report.averageSystemLength)], ["λ efectiva", fixed(report.effectiveLambda)],
    ["λ perdida", fixed(report.lostLambda)], ["Servidores activos", fixed(report.averageActiveServers)],
    ["Servidores inactivos", fixed(report.averageInactiveServers)], ["Visitas a la barra", String(report.beverageVisits)],
    ["Completados", String(report.completed)],
  ];
  return <section id="barber-report" className="animate-in fade-in slide-in-from-bottom-4 rounded-2xl border border-white/10 bg-[#171411] p-5 duration-700 print:rounded-none print:border-0 print:bg-white print:text-black sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5 print:border-black/20"><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d6b98c] print:text-black/60">Reporte final</p><h2 className="mt-2 text-2xl font-medium">Desempeño de la barbería</h2><p className="mt-2 text-xs text-white/45 print:text-black/60">{config.chairs} sillas · λ={config.lambda} · μ={config.mu} · {config.limitedQueue ? `cola límite ${config.queueLimit}` : "cola sin límite"} · {fixed(report.elapsedMinutes)} min</p></div><div className="flex gap-2 print:hidden"><button onClick={onDownload} className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 px-3 font-mono text-[10px] uppercase text-white/70 hover:bg-white/10"><Download className="h-3.5 w-3.5" /> CSV</button><button onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#d6b98c] px-3 font-mono text-[10px] uppercase text-black hover:bg-[#e2c99f]"><Printer className="h-3.5 w-3.5" /> Imprimir / PDF</button></div></div>
    <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 print:border-black/20 print:bg-black/20 sm:grid-cols-5">{metrics.map(([label, value]) => <div key={label} className="bg-[#11100e] p-4 print:bg-white"><div className="font-mono text-[9px] uppercase tracking-wider text-white/40 print:text-black/50">{label}</div><div className="mt-2 font-mono text-lg text-white print:text-black">{value}</div></div>)}</div>
    <div className="mt-7 grid gap-7 xl:grid-cols-[0.6fr_1.4fr]">
      <div><h3 className="font-mono text-xs uppercase tracking-wider">Probabilidades P(n)</h3><div className="mt-3 max-h-80 overflow-auto rounded-lg border border-white/10 print:max-h-none print:border-black/20"><table className="w-full border-collapse font-mono text-xs"><thead><tr className="bg-black/25 print:bg-black/5"><th className="p-2 text-left">n</th><th className="p-2 text-right">Probabilidad</th></tr></thead><tbody>{report.probabilities.map((row) => <tr key={row.n} className="border-t border-white/5 print:border-black/10"><td className="p-2">{row.n}</td><td className="p-2 text-right">{row.probability.toFixed(4)}</td></tr>)}</tbody></table></div></div>
      <div><h3 className="font-mono text-xs uppercase tracking-wider">Registro individual</h3><div className="mt-3 max-h-80 overflow-auto rounded-lg border border-white/10 print:max-h-none print:border-black/20"><table className="w-full min-w-[820px] border-collapse font-mono text-[10px]"><thead><tr className="bg-black/25 print:bg-black/5">{["Cliente", "Estado", "Barra", "Entre llegadas", "Llegada", "Servicio", "Inicio", "Salida", "Espera"].map((label) => <th key={label} className="p-2 text-right first:text-left">{label}</th>)}</tr></thead><tbody>{report.records.map((client) => <tr key={client.id} className="border-t border-white/5 print:border-black/10"><td className="p-2">{client.id}</td><td className="p-2 text-right">{statusLabel(client.status)}</td><td className="p-2 text-right">{client.visitedBar ? "Sí" : "No"}</td><td className="p-2 text-right">{fixed(client.interarrivalTime)}</td><td className="p-2 text-right">{fixed(client.arrivalTime)}</td><td className="p-2 text-right">{fixed(client.serviceTime)}</td><td className="p-2 text-right">{client.serviceStart === undefined ? "—" : fixed(client.serviceStart)}</td><td className="p-2 text-right">{client.departureTime === undefined ? "—" : fixed(client.departureTime)}</td><td className="p-2 text-right">{client.serviceStart === undefined ? "—" : fixed(client.serviceStart - client.arrivalTime)}</td></tr>)}</tbody></table></div></div>
    </div>
  </section>;
}

function Stepper({ label, value, min, max, step, disabled, onChange }: { label: string; value: number; min: number; max: number; step: number; disabled: boolean; onChange: (value: number) => void }) {
  const decimals = step.toString().split(".")[1]?.length ?? 0;
  const adjust = (direction: -1 | 1) => onChange(Math.min(max, Math.max(min, Number((value + direction * step).toFixed(decimals)))));
  return <div><label className="font-mono text-[10px] uppercase tracking-wider text-white/50">{label}</label><div className="mt-2 grid grid-cols-[36px_1fr_36px] overflow-hidden rounded-lg border border-white/10"><button type="button" disabled={disabled || value <= min} onClick={() => adjust(-1)} className="bg-black/20 text-white/60 hover:bg-white/10 disabled:opacity-25">−</button><input type="number" value={value} min={min} max={max} step={step} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} className="h-10 min-w-0 border-x border-white/10 bg-black/15 text-center font-mono text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" /><button type="button" disabled={disabled || value >= max} onClick={() => adjust(1)} className="bg-black/20 text-white/60 hover:bg-white/10 disabled:opacity-25">+</button></div></div>;
}

function ActionButton({ children, onClick, icon: Icon, danger = false, secondary = false }: { children: React.ReactNode; onClick: () => void; icon: typeof Play; danger?: boolean; secondary?: boolean }) {
  return <button type="button" onClick={onClick} className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg font-mono text-[10px] uppercase tracking-wider transition ${danger ? "bg-red-200 text-red-950 hover:bg-red-100" : secondary ? "border border-white/15 text-white/70 hover:bg-white/10" : "bg-[#d6b98c] text-black hover:bg-[#e2c99f]"}`}><Icon className="h-4 w-4" />{children}</button>;
}

function Status({ status }: { status: BarberClient["status"] }) {
  const colors = { waiting: "text-amber-300", serving: "text-sky-300", completed: "text-emerald-300", rejected: "text-red-300" };
  return <span className={colors[status]}>{statusLabel(status)}</span>;
}

function statusLabel(status: BarberClient["status"]) {
  return { waiting: "En espera", serving: "En servicio", completed: "Completado", rejected: "Rechazado" }[status];
}

function fixed(value: number) {
  return Number.isFinite(value) ? value.toFixed(4) : "0.0000";
}

function formatClock(minutes: number) {
  const totalSeconds = Math.floor(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, mins, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
