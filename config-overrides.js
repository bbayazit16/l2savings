import { ProvidePlugin } from "webpack"

export default override = config => {
    config.resolve.fallback = {
        util: require.resolve("util/"),
        url: require.resolve("url"),
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        vm: require.resolve("vm-browserify"),
    }

    config.plugins.push(
        new ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        })
    )

    return config
}
