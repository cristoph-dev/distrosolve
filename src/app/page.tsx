import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            distrosolve<span className="text-zinc-500">.app</span>
          </h1>
          <p className="mx-auto max-w-md text-lg text-zinc-400">
            Simulador avanzado de distribuciones de probabilidad. Comienza seleccionando una herramienta en el menu lateral.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
