import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para mejorar el manejo de archivos temporales
  experimental: {
    // Desactivar algunas optimizaciones que pueden causar problemas con archivos temporales
    optimizePackageImports: [],
  },
  // Configuración del servidor
  onDemandEntries: {
    // Tiempo máximo que una página puede estar en caché
    maxInactiveAge: 25 * 1000,
    // Número de páginas que se mantienen simultáneamente
    pagesBufferLength: 2,
  },
};

export default nextConfig;
