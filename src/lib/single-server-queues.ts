export type SingleServerQueueModel = "mm1" | "mm1k";

export interface SingleServerQueueMetrics {
  model: SingleServerQueueModel;
  lambda: number;
  serviceRate: number;
  capacity?: number;
  rho: number;
  p0: number;
  L: number;
  Lq: number;
  W: number;
  Wq: number;
  lambdaEff: number;
  lambdaLost: number;
  pk?: number;
  pn: { n: number; p: number }[];
}

const EPSILON = 1e-9;

export function calculateSingleServerUnlimited(
  lambda: number,
  serviceRate: number
): SingleServerQueueMetrics | string {
  if (!Number.isFinite(lambda) || !Number.isFinite(serviceRate)) {
    return "Las tasas deben ser valores numéricos válidos.";
  }

  if (lambda <= 0 || serviceRate <= 0) {
    return "Las tasas de llegada y servicio deben ser mayores que cero.";
  }

  if (lambda >= serviceRate) {
    return "Sistema inestable: para una cola sin límite se requiere λ < μ.";
  }

  const rho = lambda / serviceRate;
  const p0 = 1 - rho;
  const L = lambda / (serviceRate - lambda);
  const Lq = (lambda * lambda) / (serviceRate * (serviceRate - lambda));
  const W = 1 / (serviceRate - lambda);
  const Wq = lambda / (serviceRate * (serviceRate - lambda));
  const pn = Array.from({ length: 13 }, (_, n) => ({
    n,
    p: p0 * Math.pow(rho, n),
  }));

  return {
    model: "mm1",
    lambda,
    serviceRate,
    rho,
    p0,
    L,
    Lq,
    W,
    Wq,
    lambdaEff: lambda,
    lambdaLost: 0,
    pn,
  };
}

export function calculateSingleServerLimited(
  lambda: number,
  serviceRate: number,
  capacity: number
): SingleServerQueueMetrics | string {
  if (!Number.isFinite(lambda) || !Number.isFinite(serviceRate) || !Number.isFinite(capacity)) {
    return "Los parámetros deben ser valores numéricos válidos.";
  }

  if (lambda <= 0 || serviceRate <= 0) {
    return "Las tasas de llegada y servicio deben ser mayores que cero.";
  }

  const K = Math.trunc(capacity);
  if (K < 1) {
    return "La capacidad K debe ser un entero mayor o igual a 1.";
  }

  const rho = lambda / serviceRate;
  const p0 = Math.abs(rho - 1) < EPSILON
    ? 1 / (K + 1)
    : (1 - rho) / (1 - Math.pow(rho, K + 1));

  const pk = p0 * Math.pow(rho, K);
  const lambdaEff = lambda * (1 - pk);
  const lambdaLost = lambda * pk;

  const L = Math.abs(rho - 1) < EPSILON
    ? K / 2
    : (
      rho *
      (1 - (K + 1) * Math.pow(rho, K) + K * Math.pow(rho, K + 1))
    ) / ((1 - rho) * (1 - Math.pow(rho, K + 1)));

  const Lq = L - (1 - p0);
  const W = lambdaEff > 0 ? L / lambdaEff : 0;
  const Wq = lambdaEff > 0 ? Lq / lambdaEff : 0;
  const pn = Array.from({ length: K + 1 }, (_, n) => ({
    n,
    p: p0 * Math.pow(rho, n),
  }));

  return {
    model: "mm1k",
    lambda,
    serviceRate,
    capacity: K,
    rho,
    p0,
    L,
    Lq,
    W,
    Wq,
    lambdaEff,
    lambdaLost,
    pk,
    pn,
  };
}
