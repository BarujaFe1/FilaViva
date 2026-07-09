import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FilaViva — Simulador Operacional",
  description:
    "Simulador operacional para filas de atendimento. Teste cenários de capacidade, no-show e agenda antes de mudar a operação real.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-slate-50">{children}</main>
      </body>
    </html>
  )
}
