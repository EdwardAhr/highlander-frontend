import type { Metadata, Viewport } from "next";
import { Prata, Golos_Text, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Header } from "@/components/header";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { Opener } from "@/components/opener";

const prata = Prata({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-prata",
});
const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Highlander — горные туры Кавказа",
  description: "Маркетплейс горных туров Северного Кавказа",
};

export const viewport: Viewport = {
  themeColor: "#F4F8F9",
  viewportFit: "cover",
};

// Устанавливает тему до первой отрисовки (защита от «мигания»).
const themeInitScript = `(function(){try{var s=localStorage.getItem("highlander-theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${prata.variable} ${golos.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
