/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  reactCompiler: true,
  // images: {
  //   localPatterns: [{ pathname: '/galleries/*/media/**', search: '' }],
  // },
}
export default nextConfig
