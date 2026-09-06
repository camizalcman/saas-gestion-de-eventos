import {
  Dancing_Script,
  Literata,
  Lora,
  Montserrat,
  Nunito_Sans,
  Playfair_Display,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "SaaS Starter",
  description: "Next.js server-side boilerplate with Firebase Auth",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${nunitoSans.variable} ${literata.variable} ${geistMono.variable} ${playfair.variable} ${lora.variable} ${montserrat.variable} ${dancingScript.variable}`}
    >
      <body className="min-h-screen bg-surface text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
