import webpack from "webpack"
import WebpackDevServer from "webpack-dev-server"
import opn from "opn"

import config from "../webpack.config"
import nanoLogs from "webpack-nano-logs"
import runTestsWithJSDOM from "./webpack_plugins/run-tests-with-jsdom"

import logger from "nano-logger"
const log = logger("webpack-dev-server")

export default (options) => {
  options = {
    protocol: "http://",
    host: "0.0.0.0",
    port: 3000,
    open: true,
    ...(options || {}),
  }

  const serverUrl = `${options.protocol}${options.host}:${options.port}`

  const devEntries = [
    `webpack-dev-server/client?${serverUrl}`,
    `webpack/hot/only-dev-server`,
  ]

  const devConfig = {
    ...config,
    debug: true,
    watch: true,
    colors: true,
    progress: true,
    entry: {
      // add devEntries
      ...Object.keys(config.entry)
        .reduce(
          (acc, key) => {
            // entries with name that start with "test" do not need extra stuff
            acc[key] = key.indexOf("__tests__") === 0 ?
            config.entry[key] :
            [
              ...devEntries,
              ...config.entry[key],
            ]
            return acc
          },
          {}
        ),
    },
    plugins: [
      ...(config.plugins || []),
      new webpack.NoErrorsPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      nanoLogs,
      runTestsWithJSDOM({
        url: `${serverUrl}/__tests__.html`,
        compiledAssetsSources: ["__tests__.js"],
      }),
    ],
    eslint: {
      ...config.eslint,
      emitWarning: true,
    },
  }

  return new WebpackDevServer(
    webpack(devConfig),
    {
      https: options.protocol === "https://",
      contentBase: config.output.path,
      hot: true,
      stats: {
        colors: true,
      },
      noInfo: true,
    })
    .listen(options.port, options.host, () => {
      log(`Dev server started on ${serverUrl}`)
      if (options.open) {
        opn(`${serverUrl}`)
      }
    })
}
