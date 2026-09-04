import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.chocolatecompimenta.com"),
  title: {
    default: "Chocolate com Pimenta — Uma marca. Diferentes experiências.",
    template: "%s | Chocolate com Pimenta",
  },
  description:
    "Chocolate com Pimenta reúne restaurante & bar, lojas e experiências numa só marca. Gastronomia, entretenimento e produtos.",
  keywords: [
    "Chocolate com Pimenta",
    "restaurante",
    "bar",
    "lojas",
    "eventos",
  ],
  openGraph: {
    title: "Chocolate com Pimenta — Uma marca. Diferentes experiências.",
    description:
      "Gastronomia, entretenimento, produtos e experiências reunidos num só lugar.",
    siteName: "Chocolate com Pimenta",
    locale: "pt_AO",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/favicon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon-32.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-AO" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-ink text-paper">
        {children}
      </body>
    </html>
  );
}
