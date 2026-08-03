/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first, WebP second, original as the final fallback. Next negotiates
    // per request from the Accept header, so a browser that supports neither
    // still receives the JPEG — nothing breaks, it just gets no saving.
    //
    // AVIF encodes slower at build/request time than WebP but lands materially
    // smaller on photographic content, which is all this site serves.
    //
    // deviceSizes and imageSizes are DELIBERATELY LEFT AT THEIR DEFAULTS. The
    // marketing layouts cap content at 1200px and the tested breakpoints
    // (390 / 768 / 1024 / 1440) all fall inside Next's default ladder, so there
    // is no measured basis for trimming it — and a trimmed ladder is what
    // under-serves high-DPR displays. Change these only with evidence from a
    // real layout that the defaults mis-serve.
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    return {
      // beforeFiles: the single-segment /pay/:code must be proxied before the
      // filesystem/dynamic routes are consulted, since /pay/[orderId]/... exists
      // one level down. :code matches a single segment, so the 3-segment branded
      // route /pay/[orderId]/payment/[trackingCode] is untouched.
      beforeFiles: [
        {
          source: '/pay/:code',
          destination:
            'https://seal-app-9hhnm.ondigitalocean.app/api/public/pay/:code',
        },
      ],
    }
  },
}

module.exports = nextConfig
