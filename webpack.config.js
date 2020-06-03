module.exports = {
  mode: "development",

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    extensions: [".wasm", ".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"]
  },

  module: {
    rules: [
      {
        loader: "awesome-typescript-loader",
        test: /\.tsx?$/
      },
      {
        loader: "source-map-loader",
        test: /\.js$/,
        enforce: "pre"
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          }
        ]
      }
    ]
  }
};
