# distrosolve.app

distrosolve.app es una aplicacion web matematica en espanol para simular, calcular y explicar distribuciones de probabilidad y modelos de teoria de colas.

El proyecto esta pensado como una herramienta academica directa: interfaz oscura, controles compactos, resultados numericos claros, graficas legibles y glosario tecnico integrado.

## Modulos principales

- **Simulador de distribuciones**: calculo de probabilidades, estadisticos y visualizacion para distribuciones discretas y continuas.
- **Lineas de espera**: modelos de un servidor y multiples servidores, con y sin limite de capacidad.
- **Teoria de colas**: calculadoras orientadas a metricas de rendimiento del sistema.
- **Glosario**: definiciones y formulas clave para interpretar los resultados.
- **Montecarlo**: modulo reservado, actualmente bajo construccion.

## Lineas de espera incluidas

El modulo de lineas de espera permite trabajar con:

- **M/M/1**: un servidor, cola sin limite.
- **M/M/1/K**: un servidor, capacidad finita del sistema.
- **M/M/s**: multiples servidores, cola sin limite.
- **M/M/s/K**: multiples servidores, capacidad finita del sistema.

Calcula indicadores como rho, tasa de servicio, probabilidad de sistema vacio, clientes promedio en sistema y cola, tiempos promedio, distribucion de probabilidad, lambda efectiva y perdida cuando aplica.

## Stack tecnico

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/radix-ui
- lucide-react
- Recharts

## Estructura del proyecto

```txt
src/app              Rutas y pantallas principales
src/components       Componentes compartidos
src/components/ui    Componentes base de interfaz
src/lib              Logica matematica reutilizable
public               Assets publicos
```

## Desarrollo local

Instala dependencias:

```bash
npm install
```

Levanta el servidor de desarrollo:

```bash
npm run dev
```

Abre la aplicacion en:

```txt
http://localhost:3000
```

## Scripts utiles

```bash
npm run lint
npm run build
npm run start
```

## Criterios matematicos

- Las tasas de llegada y servicio deben ser positivas.
- En colas sin limite se valida estabilidad del sistema.
- En modelos con capacidad finita, `K` representa la capacidad total del sistema.
- Las formulas de cada modelo se mantienen separadas de la interfaz en `src/lib`.

## Estilo de interfaz

La aplicacion usa una estetica tecnica, oscura y monocromatica. Los datos activos se muestran en blanco y el contexto visual en escala zinc, priorizando lectura rapida y consistencia entre modulos.
