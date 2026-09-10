import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DivyaDham — Online Pooja, Chadhava & Panchang",
    short_name: "DivyaDham",
    description: "Book online poojas at famous temples, offer chadhava, consult verified pandits and follow the daily panchang.",
    start_url: "/",
    display: "standalone",
    background_color: "#fffaf3",
    theme_color: "#f0642a",
    lang: "en",
    categories: ["lifestyle", "religion"],
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Poojas", url: "/poojas" },
      { name: "Chadhava", url: "/chadhava" },
      { name: "Panchang", url: "/panchang" },
      { name: "My Bookings", url: "/bookings" },
    ],
  };
}
