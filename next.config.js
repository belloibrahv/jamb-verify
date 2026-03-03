/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" }
    ]
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' https://checkout.paystack.com https://s3-eu-west-1.amazonaws.com/pstk-public-files/js/pusher.min.js https://checkout.gointerpay.net/ https://checkout.rch.io/v2.22/fingerprint https://www.googletagmanager.com/gtag/ https://applepay.cdn-apple.com/jsapi/v1.1.0/apple-pay-sdk.js https://www.googletagmanager.com/debug/ 'unsafe-inline'; script-src-elem 'self' https://checkout.paystack.com https://s3-eu-west-1.amazonaws.com/pstk-public-files/js/pusher.min.js https://checkout.gointerpay.net/ https://checkout.rch.io/v2.22/fingerprint https://www.googletagmanager.com/gtag/ https://applepay.cdn-apple.com/jsapi/v1.1.0/apple-pay-sdk.js https://www.googletagmanager.com/debug/ 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.paystack.co https://checkout.paystack.com https://standard.paystack.com https://sockjs-eu.pusher.com https://eu-assets.i.posthog.com; frame-src https://checkout.paystack.com; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
