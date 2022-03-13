/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')(['@ory/integrations']); // pass the modules you would like to see transpiled

module.exports = withTM({
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    // ssr and displayName are configured by default
    styledComponents: true,
  },
  experimental: {
    outputStandalone: true,
  },
})