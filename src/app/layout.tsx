import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { TRPCProvider } from "@/trpc/client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Youtube clone",
  description: "Created by Ajay",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
