import type { Metadata, Viewport } from "next";
import localFont from 'next/font/local'
import { Noto_Emoji } from 'next/font/google'
import "./globals.css";
import {cn} from "lib/utils";
import { SITE } from "@/shared/config/site";
import { SkipLink } from "@/shared/ui/skip-link";
import { THEME_STORAGE_KEY } from "@/shared/config/theme";


const norse = localFont({
  src: [
    { path: '../public/fonts/norse/Norse.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/norse/Norsebold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-norse',
  display: 'swap',
})

// Interface and reading fonts of the Viking Tools design system, bundled locally (SIL OFL).
const geist = localFont({
  src: '../public/fonts/geist/Geist-Variable.woff2',
  weight: '100 900',
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = localFont({
  src: '../public/fonts/geist/GeistMono-Variable.woff2',
  weight: '100 900',
  variable: '--font-geist-mono',
  display: 'swap',
})

const newsreader = localFont({
  src: [
    { path: '../public/fonts/newsreader/Newsreader-Variable.woff2', weight: '200 800', style: 'normal' },
    { path: '../public/fonts/newsreader/Newsreader-Italic-Variable.woff2', weight: '200 800', style: 'italic' },
  ],
  variable: '--font-newsreader',
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f2ec" },
    { media: "(prefers-color-scheme: dark)", color: "#12110f" },
  ],
};

/**
 * Applies the saved theme (or the system preference) before first paint, so the
 * page never flashes the wrong colors. See ThemeToggle for the switch itself.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "dark", norse.variable, geist.variable, geistMono.variable, newsreader.variable, notoEmoji.variable, "text-xl")}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        {children}
      </body>
    </html>
  );
}
