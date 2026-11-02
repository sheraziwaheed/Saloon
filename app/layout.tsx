import { safeJson } from "@/lib/json";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { Header, Footer } from "@/components/sections/shell";
import { site } from "@/config/site";
import "./globals.css";
const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export function generateMetadata(): Metadata {
  const seo = { title: "", description: "" };
  const business = site;
  return {
    metadataBase: new URL(site.url),
    title: {
      default:
        seo.title ||
        `${business.name || site.name} | A little time. Entirely yours.`,
      template: `%s | ${business.name || site.name}`,
    },
    description:
      seo.description ||
      "Thoughtful hair, skin, beauty and wellness rituals in Mayfair and Chelsea. Discover your next little luxury at Luxe Salon.",
    openGraph: {
      type: "website",
      locale: "en_GB",
      siteName: business.name || site.name,
      images: [{ url: "/opengraph-image" }],
    },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const brand = site;
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header site={brand} />
        <main id="main">{children}</main>
        <Footer site={brand} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJson({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              name: brand.name,
              url: site.url,
              description: "Hair, beauty and wellness salon demo",
              telephone: brand.phone,
              priceRange: "££",
              address: {
                "@type": "PostalAddress",
                streetAddress: "24 Brook Street",
                addressLocality: "London",
                postalCode: "W1K 5DG",
                addressCountry: "GB",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
