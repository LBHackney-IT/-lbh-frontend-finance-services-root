const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const singleSpaDefaults = require("webpack-config-single-spa-ts");
const { merge } = require("webpack-merge");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = (webpackConfigEnv, argv) => {
  const orgName = "mtfh";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
  });

  const config = merge(defaultConfig, {
    entry: {
      "root-config": defaultConfig.entry,
      formik: "formik/dist/formik.esm.js",
      yup: "yup/es",
      "date-fns": "./src/modules/date-fns",
    },
    output: {
      filename: "[name].[contenthash].js",
    },
    externals: ["react", "react-dom"],
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].[contenthash].css",
      }),
      new HtmlWebpackPlugin({
        inject: false,
        template: "src/index.ejs",
        templateParameters: {
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
          APP_ENV: process.env.APP_ENV || "development",
          HEADER_APP_URL: process.env.HEADER_APP_URL || "//localhost:8090",
          AUTH_APP_URL: process.env.AUTH_APP_URL || "//localhost:8080",
          SEARCH_APP_URL: process.env.SEARCH_APP_URL || "//localhost:8070",
          COMMON_APP_URL: process.env.COMMON_APP_URL || "//localhost:8040",
          DIRECT_DEBIT_APP_URL:
            process.env.DIRECT_DEBIT_APP_URL || "https://d23z24vwag6pl8.cloudfront.net",
        },
      }),
    ],
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
      ],
    },
  });

  // Service workers in development are not really supported  with InjectManifest due to limitations with webpack.
  // It's not impossible, you can remove the isLocal flag in the package.json start script to test.
  // But you will need to restart webpack each time you make a change, or risk the injected manifest being incorrect.
  if (!webpackConfigEnv.isLocal) {
    config.plugins.push(
      new InjectManifest({
        swSrc: "./src/service-worker",
        swDest: "sw.js",
        manifestTransforms: [
          (manifest) => {
            const update = manifest.map((chunk) => ({
              ...chunk,
              url: `/${chunk.url}`,
            }));
            return { manifest: update };
          },
        ],
      }),
    );
  }

  return config;
};
