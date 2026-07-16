import Link from "next/link";
import { ArrowRight, Eye, Scissors, Timer, Users, Waypoints } from "lucide-react";

import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-black text-white">
      <main className="flex-1">
        <section className="relative isolate min-h-[560px] overflow-hidden">
          <div className="absolute inset-0 -z-30 bg-black" />
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.11)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.11)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black_5%,black_62%,transparent_96%)]" />
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_34%,transparent_0%,rgba(0,0,0,0.12)_32%,#000_78%)]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-b from-transparent to-black" />

          <div className="mx-auto flex min-h-[560px] w-full max-w-[1120px] flex-col justify-center px-5 py-14 sm:px-8 lg:px-10">
            <div className="animate-in fade-in slide-in-from-bottom-4 max-w-4xl duration-1000 ease-out">
              <div className="mb-7 inline-flex items-center gap-2 border border-zinc-700 bg-black/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 bg-white" />
                Probabilidad · Simulación · Teoría de colas
              </div>
              <h1 className="max-w-4xl font-mono text-[clamp(3rem,9vw,7.5rem)] font-medium leading-[0.88] tracking-[-0.075em] text-white">
                distrosolve<span className="text-zinc-500">.app</span>
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
                Herramientas matemáticas para simular distribuciones, estudiar sistemas de espera y convertir fórmulas probabilísticas en resultados claros.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/simulator" className="inline-flex h-11 items-center justify-center gap-2 bg-white px-5 font-mono text-xs uppercase tracking-wider text-black transition-colors hover:bg-zinc-200">
                  Empezar <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/glossary" className="inline-flex h-11 items-center justify-center border border-zinc-700 bg-black/70 px-5 font-mono text-xs uppercase tracking-wider text-zinc-200 backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-white">
                  Consultar glosario
                </Link>
              </div>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-1 border border-zinc-800 bg-black/70 backdrop-blur-sm sm:grid-cols-3">
              {[["04", "modelos de colas"], ["02", "distribuciones"], ["01", "base técnica"]].map(([value, label], index) => (
                <div key={label} className={`px-5 py-4 ${index > 0 ? "border-t border-zinc-800 sm:border-t-0 sm:border-l" : ""}`}>
                  <div className="font-mono text-xl text-white">{value}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="barberia" className="border-b border-zinc-900 bg-[linear-gradient(180deg,#000_0%,#050506_20%,rgba(9,9,11,0.72)_55%,rgba(9,9,11,0.5)_100%)]">
          <div className="mx-auto w-full max-w-[1120px] px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500"><Scissors className="h-4 w-4" /> Simulación aplicada</div>
                <h2 className="mt-5 text-3xl font-medium tracking-tight text-white sm:text-4xl">Simulador de barbería</h2>
                <p className="mt-5 text-[14px] leading-7 text-zinc-400">
                  Las sillas funcionan como servidores y los clientes recorren el área de espera y servicio según tiempos aleatorios de llegada y atención. El escenario conectará distribuciones, Monte Carlo y los cuatro modelos de líneas de espera.
                </p>
                <p className="mt-4 text-[13px] leading-6 text-zinc-500">
                  Podrá configurarse de 1 a 20 sillas, cola limitada o ilimitada, tasas λ y μ y una vista superior del comportamiento del sistema.
                </p>
                <Link href="/barberia" className="mt-8 inline-flex h-11 items-center justify-center gap-2 bg-white px-5 font-mono text-xs uppercase tracking-wider text-black transition-colors hover:bg-zinc-200">
                  Ir al simulador <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid border border-zinc-800 bg-black sm:grid-cols-2">
                {[
                  { icon: Users, title: "1 a 20 sillas", text: "Barberos configurables como servidores." },
                  { icon: Waypoints, title: "Área de espera", text: "Cola con o sin límite de capacidad." },
                  { icon: Timer, title: "Tasas λ y μ", text: "Llegadas y servicios en una unidad común." },
                  { icon: Eye, title: "Vista superior", text: "Seguimiento visual del estado de la barbería." },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className={`min-h-36 p-6 ${index % 2 === 0 ? "sm:border-r" : ""} ${index < 2 ? "border-b" : index === 2 ? "border-b sm:border-b-0" : ""} border-zinc-800`}>
                      <Icon className="h-4 w-4 text-zinc-500" />
                      <h3 className="mt-5 font-mono text-xs uppercase tracking-wider text-white">{item.title}</h3>
                      <p className="mt-3 text-[13px] leading-5 text-zinc-500">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
