import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/shared/ui/site-shell";

export const metadata: Metadata = {
  title: { absolute: "Page not found | Viking Tools" },
};

export default function NotFound() {
  return (
    <SiteShell>
      <h1 className="font-heading text-4xl">Page not found</h1>
      <p className="mt-4">The page you are looking for does not exist or has moved.</p>
      <p className="mt-4">
        <Link href="/" className="underline">
          Back to the Viking Tools home page
        </Link>
      </p>
    </SiteShell>
  );
}
