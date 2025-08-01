/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from "@/convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import PublicPageContent from "@/components/PublicPageContent";

export default async function PublicLinkInBioPage({ params }: any) {
  const awaitedParams = await params;
  const { username } = awaitedParams;
  const [preloadedLinks, preloadedCustomizations] = await Promise.all([
    preloadQuery(api.lib.links.getLinksBySlug, { slug: username }),
    preloadQuery(api.lib.customizations.getCustomizationsBySlug, {
      slug: username,
    }),
  ]);
  return (
    <PublicPageContent
      username={username}
      preloadedLinks={preloadedLinks}
      preloadedCustomizations={preloadedCustomizations}
    />
  );
}
