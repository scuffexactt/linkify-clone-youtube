/* eslint-disable @typescript-eslint/no-explicit-any */

import LinkAnalytics from "@/components/LinkAnalytics";
import { fetchLinkAnalytics } from "@/lib/link-analytics-server";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function LinkAnalyticsPage({ params }: any) {
  const awaitedParams = await params;  // <-- await here
  const { id } = awaitedParams;
  
  const user = await currentUser();
  if (!user) notFound();

  const analytics = await fetchLinkAnalytics(user.id, id);
  if (!analytics) {
    return (
      <LinkAnalytics
        analytics={{
          linkId: id,
          linkTitle: "This Link has no analytics",
          linkUrl:
            "Please wait for analytics to be generated or check back later",
          totalClicks: 0,
          uniqueUsers: 0,
          countriesReached: 0,
          dailyData: [],
          countryData: [],
        }}
      />
    );
  }
  return <LinkAnalytics analytics={analytics} />;
}
