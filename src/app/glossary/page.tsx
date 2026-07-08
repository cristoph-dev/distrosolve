"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { 
  ArrowRight, 
  ChevronRight, 
  BookOpen, 
  Hash, 
  Sigma, 
  Server, 
  Activity, 
  LineChart, 
  BarChart3,
  Clock,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";

// Mock data for example charts
const poissonData = [
  { x: 0, p: 0.007 }, { x: 1, p: 0.034 }, { x: 2, p: 0.084 }, { x: 3, p: 0.140 },
  { x: 4, p: 0.175 }, { x: 5, p: 0.175 }, { x: 6, p: 0.146 }, { x: 7, p: 0.104 },
  { x: 8, p: 0.065 }, { x: 9, p: 0.036 }, { x: 10, p: 0.018 }
];

const exponentialData = Array.from({ length: 40 }, (_, i) => ({
  x: i * 0.2,
  p: 0.5 * Math.exp(-0.5 * (i * 0.2))
}));

export default function GlossaryPage() {
  const scrollTo = React.useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior, block: 'start' });
  }, []);

  React.useEffect(() => {
    document.title = "Glosario | distrosolve";
  }, []);

  React.useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;

      window.requestAnimationFrame(() => {
        scrollTo(id);
      });
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);

    return () => {
      window.removeEventListener('hashchange', scrollToHash);
    };
  }, [scrollTo]);

  const sections = [
    { id: 'conceptos', title: 'Conceptos Generales' },
    { id: 'poisson', title: 'Distribución de Poisson' },
    { id: 'exponencial', title: 'Distribución Exponencial' },
    { id: 'estadisticos', title: 'Propiedades Estadísticas' },
    { id: 'colas', title: 'Teoría de Colas' },
    { id: 'metricas', title: 'Métricas de Desempeño' },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white pb-32">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto pt-24 px-6 mb-20 text-center md:text-left">
        <div className="flex items-center gap-3 text-zinc-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-6">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentación técnica</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-8 leading-[1.1]">
          Glosario de Términos
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed font-light">
          Una guía detallada sobre los fundamentos matemáticos y las métricas utilizadas en Distrosolve para el análisis de distribuciones y sistemas de espera.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row gap-16">
        {/* Sticky Sidebar Navigation */}
        <aside className="md:w-64 shrink-0 h-fit sticky top-24 hidden md:block">
          <nav className="flex flex-col space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4 px-3">En esta página</span>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="group flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 hover:text-white hover:bg-zinc-900/50 rounded-lg transition-all text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-zinc-400 transition-colors" />
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Column */}
        <main className="flex-1 max-w-3xl mx-auto md:mx-0">
          
          {/* Section: Conceptos Generales */}
          <section id="conceptos" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-medium text-white mb-8 border-b border-zinc-900 pb-4">Conceptos Generales</h2>
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-medium text-zinc-100 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-zinc-600" /> Tasa (Rate)
                </h3>
                <p className="leading-relaxed text-zinc-400 text-lg">
                  Representa la frecuencia media con la que ocurre un evento en un intervalo de tiempo o espacio determinado. En Distrosolve, se utiliza <span className="text-zinc-200 font-mono">λ (Lambda)</span> para definir llegadas y <span className="text-zinc-200 font-mono">μ (Mu)</span> para definir servicios.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-zinc-100 mb-3 flex items-center gap-2">
                  <Sigma className="w-5 h-5 text-zinc-600" /> Probabilidad
                </h3>
                <p className="leading-relaxed text-zinc-400 text-lg">
                  Es la medida cuantitativa (entre 0 y 1) de la posibilidad de que ocurra un evento. Puede expresarse como puntual (exactamente un valor) o acumulada (hasta un valor determinado).
                </p>
              </div>
            </div>
          </section>

          {/* Section: Poisson */}
          <section id="poisson" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-medium text-white mb-8 border-b border-zinc-900 pb-4">Distribución de Poisson</h2>
            <p className="leading-relaxed text-zinc-400 text-lg mb-8">
              La distribución de Poisson es una distribución de probabilidad discreta que expresa la probabilidad de que ocurra un número determinado de eventos en un intervalo fijo de tiempo o espacio, si estos eventos ocurren con una tasa media constante y de forma independiente.
            </p>
            
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 mb-10 overflow-hidden">
               <div className="flex items-center gap-2 mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                <BarChart3 className="w-4 h-4" /> Ejemplo de Masa de Probabilidad (μ=5)
               </div>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={poissonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="x" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                      <Bar dataKey="p" fill="#ffffff" radius={[2, 2, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl font-mono text-center">
                <span className="text-zinc-500 block mb-2">Fórmula de masa</span>
                <span className="text-xl text-white">P(X = k) = (e^(-μ) * μ^k) / k!</span>
              </div>
              <p className="text-zinc-400 leading-relaxed italic border-l-2 border-zinc-800 pl-6 text-base">
                Ideal para modelar el número de clientes que llegan a una tienda por hora, errores en una página de texto, o llamadas recibidas en un centro de atención.
              </p>
            </div>
          </section>

          {/* Section: Exponencial */}
          <section id="exponencial" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-medium text-white mb-8 border-b border-zinc-900 pb-4">Distribución Exponencial</h2>
            <p className="leading-relaxed text-zinc-400 text-lg mb-8">
              A diferencia de Poisson, la distribución exponencial es continua y modela el **tiempo transcurrido** entre dos eventos sucesivos que ocurren de forma independiente a una tasa constante.
            </p>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 mb-10 overflow-hidden">
               <div className="flex items-center gap-2 mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                <LineChart className="w-4 h-4" /> Ejemplo de Densidad (λ=0.5)
               </div>
               <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={exponentialData}>
                      <defs>
                        <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="x" hide />
                      <Area type="monotone" dataKey="p" stroke="#ffffff" fill="url(#glow)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl font-mono text-center">
                <span className="text-zinc-500 block mb-2">Fórmula de densidad</span>
                <span className="text-xl text-white">f(x; λ) = λ * e^(-λx)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-lg">
                Es la piedra angular de la teoría de colas para modelar los tiempos de servicio y los intervalos entre llegadas. Su propiedad clave es la **falta de memoria**.
              </p>
            </div>
          </section>

          {/* Section: Estadísticos */}
          <section id="estadisticos" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-medium text-white mb-8 border-b border-zinc-900 pb-4">Propiedades Estadísticas</h2>
            <div className="grid grid-cols-1 gap-10">
              {[
                { name: 'Promedio (Esperanza)', desc: 'El valor central esperado de la distribución a largo plazo.' },
                { name: 'Variancia', desc: 'Medida de la dispersión de los datos respecto al promedio.' },
                { name: 'Asimetría (Skewness)', desc: 'Indica si los datos se inclinan más hacia la izquierda o derecha de la media.' },
                { name: 'Curtosis', desc: 'Mide qué tan "puntiaguda" es la distribución comparada con una normal.' },
                { name: 'Coef. Variación', desc: 'Relación entre la desviación estándar y el promedio; indica variabilidad relativa.' }
              ].map((item) => (
                <div key={item.name} className="group">
                  <h4 className="text-zinc-100 font-medium text-lg mb-2 flex items-center gap-2 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4 text-zinc-700" /> {item.name}
                  </h4>
                  <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Teoría de Colas */}
          <section id="colas" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-medium text-white mb-8 border-b border-zinc-900 pb-4">Teoría de Colas</h2>
            <p className="leading-relaxed text-zinc-400 text-lg mb-12">
              Estudio matemático de las líneas de espera. Permite optimizar recursos analizando el equilibrio entre el costo del servicio y el costo de la espera.
            </p>

            {/* Visual Flow Diagram */}
            <div className="mb-16 relative">
              <div className="flex items-center justify-between gap-4 py-12 px-6 bg-zinc-900/20 border border-zinc-800 rounded-3xl">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-white border border-zinc-700">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Llegadas (λ)</span>
                </div>
                
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-[2px] bg-zinc-800 relative mb-3">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-zinc-800 rotate-45" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Cola (Lq, Wq)</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-black border-4 border-zinc-800 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <Server className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Servidor (μ)</span>
                </div>

                 <div className="flex-1 flex flex-col items-center">
                  <div className="w-full h-[2px] bg-zinc-800 relative mb-3">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-zinc-800 rotate-45" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider">Salida</span>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-medium text-zinc-100 mb-4">Modelo M/M/1</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Sistema con llegadas aleatorias, tiempo de servicio aleatorio, un único servidor y una capacidad de cola infinita. Es el modelo más básico y fundamental.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-zinc-100 mb-4">Modelo M/M/1/K</h3>
                <p className="text-zinc-400 text-lg leading-relaxed">
                  Variación donde el sistema tiene una capacidad máxima <span className="font-mono text-zinc-200">K</span>. Si un cliente llega y el sistema está lleno, es rechazado (λ Perdida).
                </p>
              </div>
            </div>
          </section>

          {/* Section: Métricas */}
          <section id="metricas" className="mb-24 scroll-mt-24">
            <h2 className="text-3xl font-medium text-white mb-8 border-b border-zinc-900 pb-4">Métricas de Desempeño</h2>
            <div className="space-y-8">
              {[
                { sym: 'ρ (Rho)', name: 'Factor de Utilización', desc: 'Porcentaje de tiempo que el servidor está ocupado. Debe ser < 1 en modelos infinitos para estabilidad.' },
                { sym: 'L', name: 'Clientes en el Sistema', desc: 'Número promedio de personas tanto en la cola como siendo atendidas.' },
                { sym: 'W', name: 'Tiempo en el Sistema', desc: 'Tiempo total promedio que un cliente pasa desde que llega hasta que sale.' },
                { sym: 'Lq', name: 'Clientes en Cola', desc: 'Promedio de clientes que esperan únicamente antes de ser atendidos.' },
                { sym: 'Wq', name: 'Tiempo en Cola', desc: 'Tiempo de espera promedio antes de recibir el servicio.' },
                { sym: 'P0', name: 'Probabilidad de Ociosidad', desc: 'Probabilidad de que el sistema esté completamente vacío.' }
              ].map((m) => (
                <div key={m.sym} className="flex gap-6 p-6 hover:bg-zinc-900/30 rounded-2xl transition-colors group">
                  <div className="text-xl font-mono text-white pt-1 shrink-0 w-16">{m.sym}</div>
                  <div>
                    <h4 className="text-zinc-100 font-medium text-lg mb-1 group-hover:text-white transition-colors">{m.name}</h4>
                    <p className="text-zinc-400 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
