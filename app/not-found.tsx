import type { Metadata } from "next";
import { TextLink } from "@/shared/ui/text-link";
import { SiteShell } from "@/shared/ui/site-shell";

export const metadata: Metadata = {
  title: { absolute: "Page not found | Viking Tools" },
};

export default function NotFound() {
  return (
    <SiteShell>
      <h1 className="font-heading text-4xl">Page not found</h1>
      <p className="mt-4">We couldn&apos;t find that page. It may have moved, or the address may have a typo.</p>
      <p className="mt-4">
        <TextLink href="/">
          Back to the home page
        </TextLink>
        {' '}or{' '}
        <TextLink href="/sign-editor">
          open the Sign Editor
        </TextLink>
        .
      </p>
    </SiteShell>
  );
}
