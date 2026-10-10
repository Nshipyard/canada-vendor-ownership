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
  metadataBase: new URL("https://vendors.canada.nshipyard.com"),
  title: "Federal Vendor Ownership: who really owns the companies getting federal contracts",
  description:
    "Vendor names resolved to corporation numbers from Corporations Canada. Ownership concentration and Canadian-versus-foreign shares of federal contract dollars, computed from open data.",
  openGraph: {
    title: "Federal Vendor Ownership: who really owns the companies getting federal contracts",
    description:
      "Vendor names resolved to corporation numbers from Corporations Canada. Ownership concentration and Canadian-versus-foreign shares of federal contract dollars, computed from open data.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Federal Vendor Ownership: who really owns the companies getting federal contracts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Federal Vendor Ownership: who really owns the companies getting federal contracts",
    description:
      "Vendor names resolved to corporation numbers from Corporations Canada. Ownership concentration and Canadian-versus-foreign shares of federal contract dollars, computed from open data.",
    images: ["/og-image.png"],
  },
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
