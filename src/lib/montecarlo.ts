import { poisson, exponential, calculateProbability, ProbType } from './distributions';

export interface MonteCarloStats {
  simulatedMean: number;
  simulatedVariance: number;
  simulatedStdDev: number;
  simulatedCoefVar: number;
  theoreticalMean: number;
  theoreticalVariance: number;
  theoreticalStdDev: number;
  theoreticalCoefVar: number;
  confidenceInterval: [number, number]; // Intervalo de confianza del 95% para la media
  sampleSize: number;
  simulatedProbability: number; // Probabilidad estimada por simulación
  theoreticalProbability: number;
  rawSamples: number[];
}

/** Genera una variable aleatoria Exponencial con parámetro lambd (tasa) */
export function randomExponential(lambd: number): number {
  // Transformada inversa: X = -ln(1 - U) / lambda
  // Como 1 - U tiene la misma distribución que U, usamos -ln(U) / lambda
  let u = Math.random();
  while (u === 0) u = Math.random(); // Evitar ln(0)
  return -Math.log(u) / lambd;
}

/** Genera una variable aleatoria de Poisson con parámetro mu (promedio) */
export function randomPoisson(mu: number): number {
  // Si mu es grande, para evitar desbordamiento bajo, podemos aproximar o usar Knuth adaptado.
  // Como en la app limitamos mu a un valor práctico (ej. 30), Knuth es adecuado.
  if (mu > 30) {
    // Aproximación Gaussiana para valores grandes de mu
    // Z ~ N(0, 1) -> X = mu + sqrt(mu) * Z, redondeado
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return Math.max(0, Math.round(mu + Math.sqrt(mu) * z));
  }

  const L = Math.exp(-mu);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L && k < 1000);
  return k - 1;
}

/** Ejecuta la simulación de Montecarlo */
export function runMonteCarloSimulation(
  distType: "Poisson" | "Exponencial",
  param: number,
  sampleSize: number,
  probType: ProbType,
  xi: number,
  xj?: number
): MonteCarloStats {
  const samples: number[] = [];
  let sum = 0;
  let sumSq = 0;
  let successes = 0;

  // Función para evaluar si un valor cae en el rango del tipo de probabilidad
  const isInRange = (x: number) => {
    const isDiscrete = distType === "Poisson";
    if (isDiscrete) {
      const k = Math.round(x);
      switch (probType) {
        case "P(X > xi)": return k > xi;
        case "P(X < xi)": return k < xi;
        case "P(X >= xi)": return k >= xi;
        case "P(X <= xi)": return k <= xi;
        case "P(X = xi)": return k === xi;
        case "P(xi < X < xj)": return xj !== undefined && k > xi && k < xj;
        case "P(xi <= X <= xj)": return xj !== undefined && k >= xi && k <= xj;
        case "P(xi <= X < xj)": return xj !== undefined && k >= xi && k < xj;
        case "P(xi < X <= xj)": return xj !== undefined && k > xi && k <= xj;
        default: return false;
      }
    } else {
      switch (probType) {
        case "P(X > xi)":
        case "P(X >= xi)": return x >= xi;
        case "P(X < xi)":
        case "P(X <= xi)": return x <= xi;
        case "P(X = xi)": return Math.abs(x - xi) < 0.05; // Pequeño margen para continua puntual
        case "P(xi < X < xj)":
        case "P(xi <= X <= xj)":
        case "P(xi <= X < xj)":
        case "P(xi < X <= xj)": return xj !== undefined && x >= xi && x <= xj;
        default: return false;
      }
    }
  };

  // Generar muestras y acumular estadísticas
  for (let i = 0; i < sampleSize; i++) {
    const val = distType === "Poisson" ? randomPoisson(param) : randomExponential(param);
    samples.push(val);
    sum += val;
    sumSq += val * val;
    if (isInRange(val)) {
      successes++;
    }
  }

  const simulatedMean = sum / sampleSize;
  // Varianza muestral insesgada
  const simulatedVariance = sampleSize > 1 ? (sumSq - (sum * sum) / sampleSize) / (sampleSize - 1) : 0;
  const simulatedStdDev = Math.sqrt(simulatedVariance);
  const simulatedCoefVar = simulatedMean !== 0 ? simulatedStdDev / simulatedMean : 0;

  // Estadísticas teóricas
  let theoreticalMean = 0;
  let theoreticalVariance = 0;
  let theoreticalStdDev = 0;
  let theoreticalCoefVar = 0;

  if (distType === "Poisson") {
    const stats = poisson.getStats(param);
    theoreticalMean = stats.Promedio;
    theoreticalVariance = stats.Variancia;
    theoreticalStdDev = stats.Desviacion_Est;
    theoreticalCoefVar = stats.Coef_Variacion;
  } else {
    const stats = exponential.getStats(param);
    theoreticalMean = stats.Promedio;
    theoreticalVariance = stats.Variancia;
    theoreticalStdDev = stats.Desviacion_Est;
    theoreticalCoefVar = stats.Coef_Variacion;
  }

  // Intervalo de confianza de 95% para la media (Z = 1.96)
  const marginError = 1.96 * (simulatedStdDev / Math.sqrt(sampleSize));
  const confidenceInterval: [number, number] = [
    Math.max(0, simulatedMean - marginError),
    simulatedMean + marginError
  ];

  const theoreticalProbability = calculateProbability(distType, param, probType, xi, xj);

  return {
    simulatedMean,
    simulatedVariance,
    simulatedStdDev,
    simulatedCoefVar,
    theoreticalMean,
    theoreticalVariance,
    theoreticalStdDev,
    theoreticalCoefVar,
    confidenceInterval,
    sampleSize,
    simulatedProbability: successes / sampleSize,
    theoreticalProbability,
    rawSamples: samples
  };
}

export interface HistogramBin {
  binLabel: string;
  binStart: number;
  binEnd: number;
  count: number;
  percentage: number; // porcentaje del total (count / sampleSize)
  theoreticalProb: number; // probabilidad teórica del bin
}

/** Genera datos agrupados para el histograma de la simulación */
export function generateHistogramData(
  samples: number[],
  distType: "Poisson" | "Exponencial",
  param: number,
  binCount = 15
): HistogramBin[] {
  const sampleSize = samples.length;
  if (sampleSize === 0) return [];

  const maxVal = Math.max(...samples);
  const minVal = Math.min(...samples);

  if (distType === "Poisson") {
    // Discreta: un bin por entero
    const counts: { [key: number]: number } = {};
    for (const val of samples) {
      const k = Math.round(val);
      counts[k] = (counts[k] || 0) + 1;
    }

    const bins: HistogramBin[] = [];
    const maxK = Math.min(maxVal, 30); // Cap de bins para legibilidad en la gráfica
    for (let k = 0; k <= maxK; k++) {
      const count = counts[k] || 0;
      const theoreticalProb = poisson.pmf(k, param);
      bins.push({
        binLabel: k.toString(),
        binStart: k,
        binEnd: k,
        count,
        percentage: count / sampleSize,
        theoreticalProb
      });
    }
    return bins;
  } else {
    // Continua: intervalos de igual ancho
    const range = maxVal - minVal;
    // Evitamos binWidth = 0 si todos los valores fuesen idénticos
    const binWidth = range > 0 ? range / binCount : 1;
    const bins: HistogramBin[] = [];
    const binCounts = new Array(binCount).fill(0);

    for (const val of samples) {
      let binIdx = Math.floor((val - minVal) / binWidth);
      if (binIdx >= binCount) binIdx = binCount - 1;
      if (binIdx < 0) binIdx = 0;
      binCounts[binIdx]++;
    }

    for (let i = 0; i < binCount; i++) {
      const binStart = minVal + i * binWidth;
      const binEnd = binStart + binWidth;
      const count = binCounts[i];
      const theoreticalProb = exponential.cdf(binEnd, param) - exponential.cdf(binStart, param);

      bins.push({
        binLabel: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}`,
        binStart,
        binEnd,
        count,
        percentage: count / sampleSize,
        theoreticalProb
      });
    }
    return bins;
  }
}

