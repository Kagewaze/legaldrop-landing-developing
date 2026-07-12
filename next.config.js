/** @type {import('next').NextConfig} */
const nextConfig = {
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
