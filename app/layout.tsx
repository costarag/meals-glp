import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoseCerta Nutri | Nutricao para canetas",
  description:
    "DoseCerta Nutri e um painel nutricional para pacientes em uso de canetas para emagrecimento e diabetes, como Ozempic, Mounjaro e Wegovy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
