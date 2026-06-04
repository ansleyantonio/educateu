/** @type {import('next').NextConfig} */
const prod = process.env.NODE_ENV === "production";
const nextConfig = {
  images: {
    domains: ["flagcdn.com", "upload.wikimedia.org"],
  },
  compiler: {
    removeConsole: prod ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;

// /** @tvpe {import('next').NextConfig} */
// const nextConfig = {
//   webpack(config) {
//     // SVG as React Component using @svgr/webpack
//     config.module.rules.push({
//       test: /\.svg$/,
//       resourceQuery: /url/, // Only apply this loader for ?url imports
//       use: ["@svgr/webpack"],
//     });
//
//     // Raw SVG file imports for next/image
//     config.module.rules.push({
//       test: /\.svg$/,
//       resourceQuery: { not: /url/ }, // Exclude imports with ?url
//       type: "asset/resource",
//     });
//
//     return config;
//   },
// };
//
// export default nextConfig;
