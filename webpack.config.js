const path = require("path")

module.exports = {
    entry: {
        "vm": "./build/vm.js",
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
        path: path.resolve(__dirname, 'dist')
    },
};

