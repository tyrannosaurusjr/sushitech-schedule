import type { Metadata } from "next";
import NearbyClient from "./NearbyClient";

export const metadata: Metadata = {
  title: "Eat & Drink Nearby | SusHi Tech Tokyo 2026 Schedule",
  description: "Curated restaurant, bar, and cafe picks near Tokyo Big Sight for SusHi Tech 2026 attendees — filtered by walk distance, quick train, and worth-the-trip.",
  openGraph: {
    title: "Eat & Drink Near Tokyo Big Sight | SusHi Tech 2026",
    description: "Curated picks near the venue — walkable spots, quick train options, and worth-the-trip destinations.",
    type: "website",
    siteName: "SusHi Tech 2026 Schedule — Built by MKUltraman",
  },
};

export default function NearbyPage() {
  return <NearbyClient />;
}
