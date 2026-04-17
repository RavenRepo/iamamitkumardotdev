const path = require("path");

const isProd = process.env.NODE_ENV === "production";

function getSupabaseOrigin() {
  const projectUrl = process.env.PROJECT_URL;
  if (!projectUrl) return null;
  try {
    return new URL(projectUrl).origin;
  } catch {
    return null;
  }
}

const supabaseOrigin = getSupabaseOrigin();

const cspParts = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.mxpnl.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.mixpanel.com https://*.google-analytics.com https://*.googletagmanager.com https://avatars.githubusercontent.com https://pbs.twimg.com https://assets.aceternity.com https://api.microlink.io",
  [
    "connect-src 'self'",
    "https://*.mixpanel.com",
    "https://cdn.mxpnl.com",
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https://api.microlink.io",
    supabaseOrigin ?? "",
  ]
    .join(" ")
    .trim(),
  "frame-src https://www.googletagmanager.com",
  "manifest-src 'self'",
];

if (isProd) {
  cspParts.push("upgrade-insecure-requests");
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "0" },
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Content-Security-Policy", value: cspParts.join("; ") },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

module.exports = {
  output: "standalone",
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.aceternity.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "api.microlink.io" },
    ],
  },
  outputFileTracingRoot: path.join(__dirname),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...securityHeaders,
          {
            key: "X-Robots-Tag",
            value:
              "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/boxshadows", destination: "/", permanent: true },
      { source: "/test", destination: "/", permanent: true },
      { source: "/playground", destination: "/", permanent: true },
      { source: "/demos", destination: "/", permanent: true },
      { source: "/demos/:path*", destination: "/", permanent: true },
      { source: "/friday", destination: "/", permanent: true },
      { source: "/snippets", destination: "/", permanent: true },
      { source: "/snippets/:path*", destination: "/", permanent: true },
      { source: "/resources", destination: "/", permanent: true },
      { source: "/links", destination: "/", permanent: true },
      { source: "/freelance", destination: "/", permanent: true },
      { source: "/design-inspiration", destination: "/", permanent: true },
      { source: "/projects", destination: "/", permanent: true },
      { source: "/freecodecamp", destination: "/", permanent: true },
    ];
  },
};
