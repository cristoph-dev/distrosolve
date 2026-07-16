export type BarberClientStatus = "waiting" | "serving" | "completed" | "rejected";

export interface BarberShopConfig {
  chairs: number;
  limitedQueue: boolean;
  queueLimit: number;
  lambda: number;
  mu: number;
}

export interface BarberClient {
  id: number;
  arrivalTime: number;
  interarrivalTime: number;
  serviceTime: number;
  serviceStart?: number;
  departureTime?: number;
  serverIndex?: number;
  remainingService: number;
  visitedBar: boolean;
  atBar: boolean;
  remainingBarTime: number;
  status: BarberClientStatus;
}

export interface BarberShopState {
  config: BarberShopConfig;
  clock: number;
  nextArrival: number;
  lastArrival: number;
  nextClientId: number;
  clients: BarberClient[];
  servers: Array<number | null>;
  areaQueue: number;
  areaSystem: number;
  areaBusyServers: number;
  stateDurations: Record<number, number>;
  accepted: number;
  rejected: number;
  running: boolean;
}

export interface BarberShopReport {
  elapsedMinutes: number;
  utilization: number;
  averageQueueTime: number;
  averageSystemTime: number;
  averageQueueLength: number;
  averageSystemLength: number;
  effectiveLambda: number;
  lostLambda: number;
  averageActiveServers: number;
  averageInactiveServers: number;
  completed: number;
  accepted: number;
  rejected: number;
  beverageVisits: number;
  probabilities: Array<{ n: number; probability: number }>;
  records: BarberClient[];
}

function randomExponential(rate: number, random: () => number): number {
  let value = random();
  while (value <= Number.EPSILON) value = random();
  return -Math.log(value) / rate;
}

export function validateBarberShopConfig(config: BarberShopConfig): string | null {
  if (!Number.isInteger(config.chairs) || config.chairs < 1 || config.chairs > 20) {
    return "La cantidad de sillas debe ser un entero entre 1 y 20.";
  }
  if (!Number.isFinite(config.lambda) || config.lambda <= 0) {
    return "La tasa de llegada λ debe ser mayor que cero.";
  }
  if (!Number.isFinite(config.mu) || config.mu <= 0) {
    return "La tasa de servicio μ debe ser mayor que cero.";
  }
  if (config.limitedQueue && (!Number.isInteger(config.queueLimit) || config.queueLimit < 0)) {
    return "El límite de la cola debe ser un entero mayor o igual que cero.";
  }
  return null;
}

export function createBarberShopState(config: BarberShopConfig, random = Math.random): BarberShopState {
  const error = validateBarberShopConfig(config);
  if (error) throw new Error(error);
  const firstInterval = randomExponential(config.lambda, random);
  return {
    config: { ...config },
    clock: 0,
    nextArrival: firstInterval,
    lastArrival: 0,
    nextClientId: 1,
    clients: [],
    servers: Array.from({ length: config.chairs }, () => null),
    areaQueue: 0,
    areaSystem: 0,
    areaBusyServers: 0,
    stateDurations: {},
    accepted: 0,
    rejected: 0,
    running: true,
  };
}

function assignWaitingClients(state: BarberShopState) {
  const waiting = state.clients.filter((client) => client.status === "waiting");
  for (let serverIndex = 0; serverIndex < state.servers.length && waiting.length > 0; serverIndex++) {
    if (state.servers[serverIndex] !== null) continue;
    const client = waiting.shift();
    if (!client) break;
    client.status = "serving";
    client.atBar = false;
    client.remainingBarTime = 0;
    client.serviceStart = state.clock;
    client.serverIndex = serverIndex;
    state.servers[serverIndex] = client.id;
  }
}

export function advanceBarberShopState(state: BarberShopState, deltaMinutes: number, random = Math.random) {
  if (!state.running || deltaMinutes <= 0) return;

  const waitingCount = state.clients.filter((client) => client.status === "waiting").length;
  const servingCount = state.servers.filter((clientId) => clientId !== null).length;
  const systemCount = waitingCount + servingCount;
  state.areaQueue += waitingCount * deltaMinutes;
  state.areaSystem += systemCount * deltaMinutes;
  state.areaBusyServers += servingCount * deltaMinutes;
  state.stateDurations[systemCount] = (state.stateDurations[systemCount] ?? 0) + deltaMinutes;
  state.clock += deltaMinutes;

  for (const client of state.clients) {
    if (client.status === "waiting" && client.atBar) {
      client.remainingBarTime -= deltaMinutes;
      if (client.remainingBarTime <= 0) {
        client.atBar = false;
        client.remainingBarTime = 0;
      }
    }
    if (client.status !== "serving") continue;
    client.remainingService -= deltaMinutes;
    if (client.remainingService > 0) continue;
    client.status = "completed";
    client.departureTime = state.clock;
    if (client.serverIndex !== undefined) state.servers[client.serverIndex] = null;
  }
  assignWaitingClients(state);

  while (state.nextArrival <= state.clock) {
    const arrivalTime = state.nextArrival;
    const interarrivalTime = arrivalTime - state.lastArrival;
    const serviceTime = randomExponential(state.config.mu, random);
    const freeServer = state.servers.findIndex((clientId) => clientId === null);
    const currentWaiting = state.clients.filter((client) => client.status === "waiting").length;
    const clientsAtBar = state.clients.filter((client) => client.status === "waiting" && client.atBar).length;
    const rejected = freeServer < 0 && state.config.limitedQueue && currentWaiting >= state.config.queueLimit;
    const visitsBar = !rejected && freeServer < 0 && clientsAtBar < 4 && random() < 0.35;
    const client: BarberClient = {
      id: state.nextClientId++,
      arrivalTime,
      interarrivalTime,
      serviceTime,
      remainingService: serviceTime,
      visitedBar: visitsBar,
      atBar: visitsBar,
      remainingBarTime: visitsBar ? 1 + random() * 3 : 0,
      status: rejected ? "rejected" : freeServer >= 0 ? "serving" : "waiting",
    };

    if (rejected) {
      client.departureTime = arrivalTime;
      state.rejected++;
    } else {
      state.accepted++;
      if (freeServer >= 0) {
        client.serviceStart = arrivalTime;
        client.serverIndex = freeServer;
        state.servers[freeServer] = client.id;
      }
    }
    state.clients.push(client);
    state.lastArrival = arrivalTime;
    state.nextArrival += randomExponential(state.config.lambda, random);
  }
  assignWaitingClients(state);
}

export function buildBarberShopReport(state: BarberShopState): BarberShopReport {
  const elapsed = Math.max(state.clock, Number.EPSILON);
  const completed = state.clients.filter((client) => client.status === "completed");
  const average = (values: number[]) => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
  const maxObserved = Math.max(0, ...Object.keys(state.stateDurations).map(Number));
  const maxN = state.config.limitedQueue
    ? state.config.chairs + state.config.queueLimit
    : maxObserved;

  return {
    elapsedMinutes: state.clock,
    utilization: state.areaBusyServers / (state.config.chairs * elapsed),
    averageQueueTime: average(completed.map((client) => (client.serviceStart ?? client.arrivalTime) - client.arrivalTime)),
    averageSystemTime: average(completed.map((client) => (client.departureTime ?? state.clock) - client.arrivalTime)),
    averageQueueLength: state.areaQueue / elapsed,
    averageSystemLength: state.areaSystem / elapsed,
    effectiveLambda: state.accepted / elapsed,
    lostLambda: state.rejected / elapsed,
    averageActiveServers: state.areaBusyServers / elapsed,
    averageInactiveServers: state.config.chairs - state.areaBusyServers / elapsed,
    completed: completed.length,
    accepted: state.accepted,
    rejected: state.rejected,
    beverageVisits: state.clients.filter((client) => client.visitedBar).length,
    probabilities: Array.from({ length: maxN + 1 }, (_, n) => ({
      n,
      probability: (state.stateDurations[n] ?? 0) / elapsed,
    })),
    records: state.clients.map((client) => ({ ...client })),
  };
}
