/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  reactCompiler: true,
  // images: {
  //   localPatterns: [{ pathname: '/galleries/*/media/**', search: '' }],
  // },
}
export default nextConfig
