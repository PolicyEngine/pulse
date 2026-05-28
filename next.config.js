/** @type {import('next').NextConfig} */
const isGitHubPagesBuild = process.env.DEPLOY_TARGET === 'github-pages'

const nextConfig = {
  output: 'export',
  basePath: isGitHubPagesBuild ? '/pulse' : '',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
