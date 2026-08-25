const path = require("path")

module.exports = {
    mode: "none",
    stats: "errors-only",
    entry: {
        "vm": "./build/src/vm.js",
    },
    optimization: {
        minimize: false,
        // splitChunks: {
        //     cacheGroups: {
        //         commons: {
        //             name: "commons",
        //             chunks: "initial",
        //             minChunks: 2,
        //             minSize: 0
        //         }
        //     }
        // },
        // chunkIds: "named" // To keep filename consistent between different modes (for example building only)
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: "vm.js",
        library: {
            name: "NestScript",
            type: "umd",
        },
        // `this` keeps the UMD wrapper compatible with older webview and
        // mini-program runtimes that do not expose `globalThis`.
        globalObject: "this",
    },
};
