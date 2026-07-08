<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# distrosolve.app Agent Guide

## Producto

distrosolve.app es una herramienta matematica en espanol para simular y explicar distribuciones de probabilidad y modelos de teoria de colas. Mantener siempre la sensacion de aplicacion tecnica: directa, compacta, clara y centrada en calculos.

## Estilo persistente

- Interfaz oscura, monocroma y sobria: negro, blanco y escala zinc.
- Evitar paletas coloridas, degradados decorativos, fondos llamativos o efectos que compitan con los datos.
- Usar tipografia mono para titulos pequenos, etiquetas, metricas, breadcrumbs, botones tecnicos y valores numericos.
- Preferir tarjetas densas, bordes zinc, radios moderados y controles rectangulares cuando la pantalla sea de calculo.
- Mantener textos de UI en espanol. La marca se escribe `distrosolve.app`.
- El tono del copy debe ser breve, academico y util: explicar lo justo para operar o entender el resultado.
- Las graficas deben priorizar legibilidad: ejes discretos, tooltips claros, blanco para datos activos y zinc para contexto.
- En bentos y tarjetas, los iconos informativos clickeables tipo `!`/info deben mostrar cursor de mano, ser visibles en gris claro y tener tamano minimo cercano a 16px. Los iconos de ayuda tipo `?` deben ser solo de hover, con cursor de ayuda/default, sin sugerir click.
- Evitar microcopy demasiado pequeno. Descripciones de tarjeta y ayudas debajo de titulos deben rondar 13px; etiquetas tecnicas secundarias no deberian bajar de 10px salvo casos muy puntuales.

## Frontend

- Stack principal: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/radix-ui, lucide-react y Recharts.
- Antes de modificar APIs, rutas, metadata, fuentes, imagenes, layouts o convenciones de Next, leer la guia relevante en `node_modules/next/dist/docs/`.
- Usar componentes existentes en `src/components/ui` antes de crear nuevos controles.
- Usar `cn` desde `src/lib/utils` para componer clases condicionales.
- Mantener imports con alias `@/` cuando ya sea el patron local.
- Componentes interactivos deben declarar `"use client"` solo cuando usen estado, efectos, refs o handlers del cliente.
- No convertir pantallas enteras a client components si la interactividad puede aislarse en un componente menor.
- Evitar SVG inline nuevo si `lucide-react` ya tiene un icono adecuado.

## Matematica y dominio

- Mantener la logica matematica en `src/lib`, separada de la UI.
- Validar parametros antes de calcular: tasas positivas, rangos coherentes y casos inestables en colas.
- Para distribuciones discretas, cuidar las diferencias entre `<`, `<=`, `>`, `>=` y `=`.
- Para distribuciones continuas, recordar que intervalos abiertos y cerrados tienen la misma probabilidad.
- No cambiar formulas sin dejar clara la razon en el codigo o en la respuesta.
- Si agregas una distribucion o modelo, incluir estadisticos, calculo de probabilidad/metricas y datos de grafica consistentes con la UI existente.

## Estructura

- Rutas en `src/app`.
- Componentes compartidos en `src/components`.
- Componentes de shadcn en `src/components/ui`.
- Logica reutilizable en `src/lib`.
- Assets publicos en `public`.

## Calidad

- Ejecutar `npm run lint` cuando el cambio toque TypeScript, React, rutas o estilos.
- Ejecutar `npm run build` si el cambio afecta configuracion de Next, metadata, layout global, dependencias o comportamiento compartido.
- Mantener cambios pequenos y localizados. No reordenar archivos ni reformatear pantallas completas si no hace falta.
- Revisar responsive en pantallas de calculo: nada debe solaparse, cortarse o causar saltos grandes al aparecer resultados/graficas.
- Proteger el trabajo existente del usuario. No revertir cambios ajenos ni limpiar archivos no relacionados.
