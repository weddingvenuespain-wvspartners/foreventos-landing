import type { NextConfig } from "next";

// Cabeceras de seguridad para toda la landing.
// CSP: la página usa estilos y scripts inline (HTML estático único), así que
// se permite 'unsafe-inline' pero se bloquea todo origen externo salvo fuentes.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com",
      "font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com",
      "img-src 'self' data:",
      // El formulario de contacto hace fetch a la API de la app (antes quedaba
      // bloqueado por CSP y siempre caía al mailto de respaldo).
      "connect-src 'self' https://app.foreventos.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://app.foreventos.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // foreventos.com/demo: dirección corta para enviar; la demo vive en la app
  // (el panel real solo funciona en app.foreventos.com)
  async redirects() {
    return [
      { source: "/demo", destination: "https://app.foreventos.com/demo", permanent: false },
      { source: "/demo/:codigo", destination: "https://app.foreventos.com/demo/:codigo", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
