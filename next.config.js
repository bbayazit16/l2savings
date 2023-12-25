/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    webpack: config => {
        config.resolve.fallback = {
            "mongodb-client-encryption": false,
            "bson-ext": false,
            "kerberos": false,
            "snappy": false,
            "@mongodb-js/zstd": false,
            aws4: false,
        }

        return config
    },
}

module.exports = nextConfig
