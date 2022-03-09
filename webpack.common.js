const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");


const fileExtensions = ["png"];

module.exports = {
  entry: {
    main: path.join(__dirname, "src/main.ts"),
    worker: path.join(__dirname, "src/worker.ts"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      // loads the icon to the dist directory
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/
      },
      {
        test: /\.(ico)$/i,
        use: [
          {
            loader: 'url-loader',
          },
        ],
      },
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          transform: function (content, path) {
            // generates the manifest file using the package.json information
            return Buffer.from(JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString())
            }));
          }
        }
      ]
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  }
};
