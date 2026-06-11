
/**
 * Lógica matemática para modelos de Teoría de Colas.
 * Enfocado en sistemas M/M/1 (Un servidor, colas infinitas y finitas).
 */

export interface QueueMetrics {
  rho: number;
  p0: number;
  L: number;
  Lq: number;
  W: number;
  Wq: number;
  lambdaEff?: number;
  lambdaLost?: number;
  pk?: number;
  pn: { n: number; p: number }[];
}

/**
 * Modelo M/M/1: Un servidor, cola infinita.
 * @param lambda Tasa de llegada (clientes/tiempo)
 * @param mu Tasa de servicio (clientes/tiempo)
 */
export function calculateMM1(lambda: number, mu: number): QueueMetrics | string {
  if (lambda <= 0 || mu <= 0) return "Las tasas deben ser mayores a cero.";
  if (lambda >= mu) return "Sistema inestable (Lambda debe ser menor a Mu para colas infinitas).";

  const rho = lambda / mu;
  const p0 = 1 - rho;
  const L = lambda / (mu - lambda);
  const Lq = (lambda * lambda) / (mu * (mu - lambda));
  const W = 1 / (mu - lambda);
  const Wq = lambda / (mu * (mu - lambda));

  const pn = [];
  for (let n = 0; n <= 10; n++) {
    pn.push({ n, p: p0 * Math.pow(rho, n) });
  }

  return { rho, p0, L, Lq, W, Wq, pn };
}

/**
 * Modelo M/M/1/K: Un servidor, cola finita (Capacidad del sistema K).
 * @param lambda Tasa de llegada
 * @param mu Tasa de servicio
 * @param K Capacidad máxima del sistema (incluyendo el cliente en servicio)
 */
export function calculateMM1K(lambda: number, mu: number, K: number): QueueMetrics | string {
  if (lambda <= 0 || mu <= 0 || K <= 0) return "Los parámetros deben ser mayores a cero.";
  
  const rho = lambda / mu;
  let p0: number;

  if (Math.abs(rho - 1) < 1e-9) {
    p0 = 1 / (K + 1);
  } else {
    p0 = (1 - rho) / (1 - Math.pow(rho, K + 1));
  }

  const pk = p0 * Math.pow(rho, K);
  const lambdaEff = lambda * (1 - pk);
  const lambdaLost = lambda * pk;

  let L: number;
  if (Math.abs(rho - 1) < 1e-9) {
    L = K / 2;
  } else {
    const num = rho * (1 - (K + 1) * Math.pow(rho, K) + K * Math.pow(rho, K + 1));
    const den = (1 - rho) * (1 - Math.pow(rho, K + 1));
    L = num / den;
  }

  const Lq = L - (1 - p0);
  const W = L / lambdaEff;
  const Wq = Lq / lambdaEff;

  const pn = [];
  for (let n = 0; n <= K; n++) {
    pn.push({ n, p: p0 * Math.pow(rho, n) });
  }

  return { rho, p0, L, Lq, W, Wq, lambdaEff, lambdaLost, pk, pn };
}
