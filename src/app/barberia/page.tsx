import type { Metadata } from "next";

import BarberShopSimulator from "./BarberShopSimulator";

export const metadata: Metadata = {
  title: "distrosolve | Simulador de barbería",
  description: "Simulación visual de una barbería con líneas de espera, servidores y reporte de desempeño.",
};

export default function BarberShopPage() {
  return <BarberShopSimulator />;
}
