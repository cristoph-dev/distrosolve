export type MultipleServerQueueModel = "mms" | "mmsk";

export interface MultipleServerQueueMetrics {
  model: MultipleServerQueueModel;
  lambda: number;
  serviceRate: number;
  servers: number;
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

function factorial(n: number) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function stateWeight(n: number, traffic: number, servers: number) {
  if (n < servers) {
    return Math.pow(traffic, n) / factorial(n);
  }

  return Math.pow(traffic, n) / (factorial(servers) * Math.pow(servers, n - servers));
}

function validateBase(lambda: number, serviceRate: number, servers: number) {
  if (!Number.isFinite(lambda) || !Number.isFinite(serviceRate) || !Number.isFinite(servers)) {
    return "Los parámetros deben ser valores numéricos válidos.";
  }

  const c = Math.trunc(servers);
  if (lambda <= 0 || serviceRate <= 0) {
    return "Las tasas de llegada y servicio deben ser mayores que cero.";
  }

  if (c < 2) {
    return "El número de servidores debe ser un entero mayor o igual a 2.";
  }

  return c;
}

export function calculateMultipleServerUnlimited(
  lambda: number,
  serviceRate: number,
  servers: number
): MultipleServerQueueMetrics | string {
  const validatedServers = validateBase(lambda, serviceRate, servers);
  if (typeof validatedServers === "string") return validatedServers;

  const c = validatedServers;
  const traffic = lambda / serviceRate;
  const rho = lambda / (c * serviceRate);

  if (rho >= 1) {
    return "Sistema inestable: para cola sin límite se requiere λ < sμ.";
  }

  let normalizer = 0;
  for (let n = 0; n < c; n++) {
    normalizer += Math.pow(traffic, n) / factorial(n);
  }
  normalizer += Math.pow(traffic, c) / (factorial(c) * (1 - rho));

  const p0 = 1 / normalizer;
  const Lq = (
    p0 *
    Math.pow(traffic, c) *
    rho
  ) / (factorial(c) * Math.pow(1 - rho, 2));
  const L = Lq + traffic;
  const W = L / lambda;
  const Wq = Lq / lambda;
  const maxN = Math.max(12, c + 10);
  const pn = Array.from({ length: maxN + 1 }, (_, n) => ({
    n,
    p: p0 * stateWeight(n, traffic, c),
  }));

  return {
    model: "mms",
    lambda,
    serviceRate,
    servers: c,
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

export function calculateMultipleServerLimited(
  lambda: number,
  serviceRate: number,
  servers: number,
  capacity: number
): MultipleServerQueueMetrics | string {
  const validatedServers = validateBase(lambda, serviceRate, servers);
  if (typeof validatedServers === "string") return validatedServers;

  if (!Number.isFinite(capacity)) {
    return "La capacidad K debe ser un valor numérico válido.";
  }

  const c = validatedServers;
  const K = Math.trunc(capacity);
  if (K < c) {
    return "La capacidad K debe ser mayor o igual al número de servidores.";
  }

  const traffic = lambda / serviceRate;
  const rho = lambda / (c * serviceRate);
  const weights = Array.from({ length: K + 1 }, (_, n) => stateWeight(n, traffic, c));
  const p0 = 1 / weights.reduce((sum, weight) => sum + weight, 0);
  const pn = weights.map((weight, n) => ({ n, p: p0 * weight }));
  const pk = pn[K]?.p ?? 0;
  const lambdaEff = lambda * (1 - pk);
  const lambdaLost = lambda * pk;
  const L = pn.reduce((sum, state) => sum + state.n * state.p, 0);
  const Lq = pn.reduce((sum, state) => sum + Math.max(state.n - c, 0) * state.p, 0);
  const W = lambdaEff > 0 ? L / lambdaEff : 0;
  const Wq = lambdaEff > 0 ? Lq / lambdaEff : 0;

  return {
    model: "mmsk",
    lambda,
    serviceRate,
    servers: c,
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
