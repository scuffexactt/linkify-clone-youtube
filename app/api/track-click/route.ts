import { NextRequest, NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { api } from "@/convex/_generated/api";
import { ClientTrackingData, ServerTrackingEvent } from "@/lib/types";
import { getClient } from "@/convex/client";

export async function POST(request: NextRequest) {
  try {
    const data: ClientTrackingData = await request.json();

    const geo = geolocation(request);

    const convex = getClient();

    // Get user ID from username (slug)
    const userId = await convex.query(api.lib.usernames.getUserIdBySlug, {
      slug: data.profileUsername,
    });

    if (!userId) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Build full tracking event
    const trackingEvent: ServerTrackingEvent = {
      ...data, // client-side data
      timestamp: new Date().toISOString(),
      profileUserId: userId,
      location: {
        country: geo?.country || "",
        region: geo?.region || "",
        city: geo?.city || "",
        latitude: geo?.latitude || "",
        longitude: geo?.longitude || "",
      },
      userAgent: data.userAgent || request.headers.get("user-agent") || "unknown",
    };

    // Send event to Tinybird if configured
    if (process.env.TINYBIRD_TOKEN && process.env.TINYBIRD_HOST) {
      try {
        const eventForTinybird = {
          timestamp: trackingEvent.timestamp,
          profileUsername: trackingEvent.profileUsername,
          profileUserId: trackingEvent.profileUserId,
          linkId: trackingEvent.linkId,
          linkTitle: trackingEvent.linkTitle,
          linkUrl: trackingEvent.linkUrl,
          userAgent: trackingEvent.userAgent,
          referrer: trackingEvent.referrer,
          location: {
            country: trackingEvent.location.country,
            region: trackingEvent.location.region,
            city: trackingEvent.location.city,
            latitude: trackingEvent.location.latitude,
            longitude: trackingEvent.location.longitude,
          },
        };

        console.log("Sending event to Tinybird:", JSON.stringify(eventForTinybird, null, 2));

        const tinybirdResponse = await fetch(
          `${process.env.TINYBIRD_HOST}/v0/events?name=link_clicks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.TINYBIRD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventForTinybird),
          }
        );

        if (!tinybirdResponse.ok) {
          const errorText = await tinybirdResponse.text();
          console.error("Failed to send to Tinybird:", errorText);
        } else {
          const responseBody = await tinybirdResponse.json();
          console.log("Successfully sent to Tinybird:", responseBody);

          if (responseBody.quarantined_rows > 0) {
            console.warn("Some rows were quarantined:", responseBody);
          }
        }
      } catch (tinybirdError) {
        console.error("Tinybird request failed:", tinybirdError);
      }
    } else {
      console.log("Tinybird not configured - event logged only");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking click:", error);
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 });
  }
}
