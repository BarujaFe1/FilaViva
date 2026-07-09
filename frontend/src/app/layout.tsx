import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import LabBanner from "@/components/layout/LabBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FilaViva — Simulador Operacional (Lab Demo)",
  description:
    "Lab demo pública: simule filas de atendimento com dados sintéticos, score de risco e comparação de cenários. Não é produção de call center.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LabBanner />
        <Header />
        <main className="min-h-screen bg-slate-50">{children}</main>
      </body>
    </html>
  )
}
