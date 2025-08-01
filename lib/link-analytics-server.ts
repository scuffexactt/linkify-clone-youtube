export interface LinkAnalyticsData {
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  totalClicks: number;
  uniqueUsers: number;
  countriesReached: number;
  dailyData: Array<{
    date: string;
    clicks: number;
    uniqueUsers: number;
    countries: number;
  }>;
  countryData: Array<{
    country: string;
    clicks: number;
    percentage: number;
  }>;
}

interface TinybirdLinkAnalyticsRow {
  date: string;
  linkId: string;
  linkTitle: string;
  linkUrl: string;
  total_clicks: number;
  unique_users: number;
  countries_reached: number;
}

interface TinybirdCountryAnalyticsRow {
  country: string;
  total_clicks: number;
  unique_users: number;
  percentage: number;
}

export async function fetchLinkAnalytics(
  userId: string,
  linkId: string,
  daysBack: number = 30
): Promise<LinkAnalyticsData | null> {
  const token = process.env.TINYBIRD_TOKEN;
  const host = process.env.TINYBIRD_HOST;

  if (!token || !host) {
    console.warn("Tinybird config missing, returning empty analytics");
    return {
      linkId,
      linkTitle: "Sample Link",
      linkUrl: "https://example.com",
      totalClicks: 0,
      uniqueUsers: 0,
      countriesReached: 0,
      dailyData: [],
      countryData: [],
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // Fetch fast analytics first
    console.log("Fetching fast analytics for linkId:", linkId);

    let response = await fetch(
      `${host}/v0/pipes/fast_link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
      {
        headers,
        cache: "no-store",
      }
    );

    let json = await response.json();
    let rows = json.data as TinybirdLinkAnalyticsRow[];

    // If fast analytics empty or error, fallback to full analytics
    if (!response.ok || !rows || rows.length === 0) {
      console.warn("Fast analytics failed or empty, falling back to full analytics");

      response = await fetch(
        `${host}/v0/pipes/link_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
        {
          headers,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.error("Full analytics request failed:", await response.text());
        return null;
      }

      json = await response.json();
      rows = json.data as TinybirdLinkAnalyticsRow[];

      if (!rows || rows.length === 0) {
        console.warn("Full analytics returned empty data");
        return null;
      }
    }

    // Prepare daily data sorted oldest first (date ascending)
    const dailyData = rows
      .map((row) => ({
        date: row.date,
        clicks: row.total_clicks || 0,
        uniqueUsers: row.unique_users || 0,
        countries: row.countries_reached || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalClicks = dailyData.reduce((sum, day) => sum + day.clicks, 0);
    const uniqueUsers = Math.max(...dailyData.map((d) => d.uniqueUsers), 0);
    const countriesReached = Math.max(...dailyData.map((d) => d.countries), 0);

    const firstRow = rows[0];

    // Fetch country data
    let countryData: LinkAnalyticsData["countryData"] = [];

    try {
      const countryResponse = await fetch(
        `${host}/v0/pipes/link_country_analytics.json?profileUserId=${userId}&linkId=${linkId}&days_back=${daysBack}`,
        {
          headers,
          cache: "no-store",
        }
      );

      if (countryResponse.ok) {
        const countryJson = await countryResponse.json();
        const countryRows = countryJson.data as TinybirdCountryAnalyticsRow[];

        if (!countryRows || countryRows.length === 0) {
          console.warn("No country data returned");
        } else {
          countryData = countryRows.map((row) => ({
            country: row.country || "Unknown",
            clicks: row.total_clicks || 0,
            percentage: row.percentage || 0,
          }));
        }
      } else {
        console.warn("Country analytics request failed:", await countryResponse.text());
      }
    } catch (err) {
      console.error("Failed to fetch country analytics:", err);
    }

    return {
      linkId,
      linkTitle: firstRow.linkTitle || "Unknown Link",
      linkUrl: firstRow.linkUrl || "",
      totalClicks,
      uniqueUsers,
      countriesReached,
      dailyData,
      countryData,
    };
  } catch (err) {
    console.error("Tinybird analytics error:", err);
    return null;
  }
}
