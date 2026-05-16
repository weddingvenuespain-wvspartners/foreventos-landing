import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ForEventos — La plataforma para venues de bodas",
  description: "Centraliza leads, propuestas digitales y disponibilidad. La plataforma que conecta tus espacios con parejas de todo el mundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
