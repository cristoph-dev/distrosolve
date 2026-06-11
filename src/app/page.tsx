export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6">
      <main className="flex flex-col items-center text-center max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
          distrosolve<span className="text-zinc-500">.app</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-md">
          Simulador avanzado de distribuciones de probabilidad. Comienza seleccionando una herramienta en el menú lateral.
        </p>
      </main>
    </div>
  );
}
