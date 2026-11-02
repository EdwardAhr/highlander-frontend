import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Manrope,
  IBM_Plex_Mono,
  Unbounded,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Opener } from "@/components/opener";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
});
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-manrope",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  title: "Highlander — горные туры Кавказа",
  description: "Маркетплейс горных туров Северного Кавказа",
};

// Устанавливает тему до первой отрисовки (защита от «мигания»).
const themeInitScript = `(function(){try{var s=localStorage.getItem("highlander-theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${manrope.variable} ${plexMono.variable} ${unbounded.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Opener />
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
