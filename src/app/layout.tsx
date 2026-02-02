import "./globals.css";
// Mapa: pigeon-maps no requiere CSS global
// Importanción de fuentes
import {
  Poppins,
  Roboto,
  Inter,
  Manrope,
  Montserrat,
  Rubik,
  Open_Sans,
} from "next/font/google";
import ReduxProvider from "@/src/lib/store/ReduxProvider";
import { NotificationsProvider } from "@/src/lib/notifications/NotificationsContext";
import { Metadata } from "next";
import { Toaster } from "sonner";

// Weights: 400 = normal, 500 = medium, 700 = bold, 900 = black
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-roboto",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "900"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});

export const viewport = {
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Reddi",
  description: "App de entregas",
  // Agrega esta línea:
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico", // Icono pestaña
    shortcut: "/pwa/icons/maskable_icon_x192.png",
    apple: "/pwa/icons/maskable_icon_x192.png", // CRUCIAL para iOS
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${roboto.variable} ${inter.variable} ${manrope.variable} ${montserrat.variable} ${rubik.variable} ${openSans.variable}`}
    >
      <body className="flex flex-col min-h-screen font-poppins">
        <ReduxProvider>
          <NotificationsProvider>
            {children}
            <Toaster richColors position="top-center" closeButton />
          </NotificationsProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
