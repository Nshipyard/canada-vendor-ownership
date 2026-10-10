import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/i18n";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Federal Vendor Ownership: who really owns the companies getting federal contracts",
  description:
    "Vendor names resolved to corporation numbers from Corporations Canada. Ownership concentration and Canadian-versus-foreign shares of federal contract dollars, computed from open data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable}`}>
      <body>
        <LangProvider>
          <Nav />
          {children}
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
