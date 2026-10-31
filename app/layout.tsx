import "./globals.css";
export const metadata = { title: "Ternary Cargo" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
