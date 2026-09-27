import type { CapacitorConfig } from "@capacitor/cli";

/**
 * DivyaDham's phone apps (Android and iPhone) are this website in a native shell.
 *
 * The shell opens the live site, so a web deploy reaches both apps with no
 * store update. What the shell adds is what a browser tab cannot give a devotee:
 * notifications that arrive with the app closed (Firebase Cloud Messaging), an
 * icon on the home screen from the stores, and an offline page instead of the
 * web view's own error.
 *
 * The same pattern as Dino's apps (ryanshawplasma/dino), which run this way in
 * Play and TestFlight.
 */
const config: CapacitorConfig = {
  // Fixed forever by the Play Console listing (created 27 Sep 2026) and the
  // iOS App ID. Never change it: a new id is a new app with no users.
  appId: "com.neelkanth.myapp",
  appName: "DivyaDham",
  webDir: "capacitor/www",
  server: {
    // The live site. CAP_SERVER_URL lets a build point at a preview.
    url: process.env.CAP_SERVER_URL ?? "https://neelkanth-alpha.vercel.app",
    androidScheme: "https",
    iosScheme: "https",
    cleartext: false,
    allowNavigation: ["neelkanth-alpha.vercel.app"],
    // Shown in place of the web view's error page when the site is unreachable.
    errorPath: "offline.html",
  },
  // Lets the site tell the app from a browser (for example to offer native
  // notifications instead of web push), and which build it is.
  appendUserAgent: `DivyaDhamApp/${process.env.APP_VERSION_NAME ?? "dev"}`,
  android: {
    backgroundColor: "#fffaf3",
  },
  ios: {
    backgroundColor: "#fffaf3",
    contentInset: "never",
  },
  plugins: {
    FirebaseMessaging: {
      // A notification that arrives while the app is open still shows.
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
