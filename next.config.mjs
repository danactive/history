const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  eslint: {
    dirs: ['pages', 'src', '__tests__', 'app'],
  },
}
export default nextConfig
