/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            // Prevent MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Control referrer information
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Prevent clickjacking attacks
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Enable browser XSS protection
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          (() => {
            const isDev = process.env.NODE_ENV === 'development'
            // Allow inline scripts in production temporarily to prevent CSP blocking
            // (short-term fix; replace with nonces/hashes or external scripts for production hardening)
            const scriptSrc = isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline'"
            const styleSrc = isDev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self'"
            return {
              // Content Security Policy - Prevents XSS attacks
              key: 'Content-Security-Policy',
              value: [
                "default-src 'self'",
                scriptSrc,
                styleSrc,
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}`,
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
              ].join('; '),
            }
          })(),
          {
            // Permissions Policy - Control browser features
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // React strict mode for better error detection
  reactStrictMode: true,
  
  // Disable X-Powered-By header (don't reveal Next.js)
  poweredByHeader: false,
};

export default nextConfig;

// Proxy API requests to the backend during development so the browser uses
// the same origin and can send HttpOnly cookies with `fetch(credentials:'include')`.
nextConfig.rewrites = async () => {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/:path*`,
    },
  ]
}
