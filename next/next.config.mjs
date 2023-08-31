const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  experimental: {
    newNextLinkBehavior: true,
  },
  eslint: {
    dirs: ['pages', 'src', '__tests__'],
  },
}
export default nextConfig
