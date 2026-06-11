
/**
 * Lógica matemática para distribuciones de probabilidad.
 * Basado en la lógica de scipy.stats (Python).
 */

// --- Utilidades Matemáticas ---

/** Factorial para Poisson */
function factorial(n: number): number {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// --- Distribución de Poisson ---

export interface PoissonStats {
  Promedio: number;
  Variancia: number;
  Desviacion_Est: number;
  Asimetria: number;
  Curtosis: number;
  Coef_Variacion: number;
}

export const poisson = {
  /** Función de Masa de Probabilidad (PMF) */
  pmf: (k: number, mu: number): number => {
    if (k < 0 || !Number.isInteger(k)) return 0;
    return (Math.exp(-mu) * Math.pow(mu, k)) / factorial(k);
  },

  /** Función de Distribución Acumulativa (CDF) */
  cdf: (k: number, mu: number): number => {
    if (k < 0) return 0;
    let sum = 0;
    for (let i = 0; i <= Math.floor(k); i++) {
      sum += poisson.pmf(i, mu);
    }
    return sum;
  },

  /** Estadísticos de la distribución */
  getStats: (mu: number): PoissonStats => {
    const promedio = mu;
    const variancia = mu;
    const desviacion = Math.sqrt(mu);
    return {
      Promedio: promedio,
      Variancia: variancia,
      Desviacion_Est: desviacion,
      Asimetria: 1 / Math.sqrt(mu),
      Curtosis: 1 / mu,
      Coef_Variacion: promedio !== 0 ? desviacion / promedio : 0
    };
  }
};

// --- Distribución Exponencial ---

export interface ExponentialStats {
  Promedio: number;
  Variancia: number;
  Desviacion_Est: number;
  Asimetria: number;
  Curtosis: number;
  Coef_Variacion: number;
}

export const exponential = {
  /** Función de Densidad de Probabilidad (PDF) */
  pdf: (x: number, lambd: number): number => {
    if (x < 0) return 0;
    return lambd * Math.exp(-lambd * x);
  },

  /** Función de Distribución Acumulativa (CDF) */
  cdf: (x: number, lambd: number): number => {
    if (x < 0) return 0;
    return 1 - Math.exp(-lambd * x);
  },

  /** Estadísticos de la distribución */
  getStats: (lambd: number): ExponentialStats => {
    const promedio = 1 / lambd;
    const variancia = 1 / (lambd * lambd);
    const desviacion = 1 / lambd;
    return {
      Promedio: promedio,
      Variancia: variancia,
      Desviacion_Est: desviacion,
      Asimetria: 2,
      Curtosis: 6,
      Coef_Variacion: 1 // Para exponencial, desviacion / promedio siempre es 1
    };
  }
};

// --- Lógica de Probabilidades por Intervalo ---

export type ProbType = 
  | "P(X > xi)" 
  | "P(X < xi)" 
  | "P(X >= xi)" 
  | "P(X <= xi)"
  | "P(X = xi)"
  | "P(xi < X < xj)"
  | "P(xi <= X <= xj)"
  | "P(xi <= X < xj)"
  | "P(xi < X <= xj)";

export function calculateProbability(
  distType: "Poisson" | "Exponencial",
  param: number,
  type: ProbType,
  xi: number,
  xj?: number
): number {
  if (distType === "Poisson") {
    const mu = param;
    const dist = poisson;
    switch (type) {
      case "P(X > xi)":     return 1 - dist.cdf(xi, mu);
      case "P(X < xi)":     return dist.cdf(xi - 1, mu);
      case "P(X >= xi)":    return 1 - dist.cdf(xi - 1, mu);
      case "P(X <= xi)":    return dist.cdf(xi, mu);
      case "P(X = xi)":     return dist.pmf(xi, mu);
      default:
        if (xj === undefined) return 0;
        switch (type) {
          case "P(xi < X < xj)":   return Math.max(0, dist.cdf(xj - 1, mu) - dist.cdf(xi, mu));
          case "P(xi <= X <= xj)": return Math.max(0, dist.cdf(xj, mu) - dist.cdf(xi - 1, mu));
          case "P(xi <= X < xj)":  return Math.max(0, dist.cdf(xj - 1, mu) - dist.cdf(xi - 1, mu));
          case "P(xi < X <= xj)":  return Math.max(0, dist.cdf(xj, mu) - dist.cdf(xi, mu));
          default: return 0;
        }
    }
  } else {
    const lambd = param;
    const dist = exponential;
    // Para continua, P(X < xi) = P(X <= xi)
    switch (type) {
      case "P(X > xi)":
      case "P(X >= xi)":    return 1 - dist.cdf(xi, lambd);
      case "P(X < xi)":
      case "P(X <= xi)":    return dist.cdf(xi, lambd);
      case "P(X = xi)":     return 0;
      default:
        if (xj === undefined) return 0;
        // Para continua, los intervalos abiertos/cerrados son iguales
        return Math.max(0, dist.cdf(xj, lambd) - dist.cdf(xi, lambd));
    }
  }
}
