import "./globals.css";
import { Inter, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { StoreProvider } from "@/lib/store";
import { TooltipProvider } from "@/components/ui/tooltip";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
export const metadata = { title: "Ternary Cargo", icons: { icon: "/brand/ternary-favicon-colour.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plex.variable} ${mono.variable}`}><body className="bg-background font-sans text-[15px] text-foreground antialiased">
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange><TooltipProvider delayDuration={150}><StoreProvider>{children}</StoreProvider></TooltipProvider><Toaster position="bottom-left" richColors closeButton offset={16} /></ThemeProvider></body></html>;
}
