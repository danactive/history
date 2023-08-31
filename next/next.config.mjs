module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ['localhost'],
  },
  experimental: {
    newNextLinkBehavior: true,
  },
  eslint: {
    dirs: ['pages', 'src', '__tests__'],
  },
}
