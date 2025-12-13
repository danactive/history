/** @type {import('next').NextConfig} */
const nextConfig = {
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
