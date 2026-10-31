import "./globals.css";
import { Inter, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { StoreProvider } from "@/lib/store";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
export const metadata = { title: "Ternary Cargo", icons: { icon: "/brand/ternary-favicon-colour.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${inter.variable} ${plex.variable} ${mono.variable}`}><body className="bg-background font-sans text-foreground antialiased"><StoreProvider>{children}</StoreProvider></body></html>;
}
