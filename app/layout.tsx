import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local'
import { Noto_Emoji } from 'next/font/google'
import "./globals.css";
import {cn} from "lib/utils";
import { SITE } from "@/shared/config/site";
import { SkipLink } from "@/shared/ui/skip-link";


const norse = localFont({
  src: [
    { path: '../public/fonts/norse/Norse.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/norse/Norsebold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-norse',
  display: 'swap',
})

const notoEmoji = Noto_Emoji({
  subsets: ['emoji'],
  variable: '--font-noto-emoji',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: SITE.name,
  title: `${SITE.name} | Free Sign Editor & Tools for Valheim`,
  description: SITE.description,
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: "website" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#484b6a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "dark", norse.className, norse.variable, notoEmoji.variable, "text-xl")}
    >
      <body className="min-h-full flex flex-col">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
