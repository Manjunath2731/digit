const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add the process polyfill
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    })
  );

  // Add the fallback for the 'process' module
  if (!config.resolve.fallback) {
    config.resolve.fallback = {};
  }
  config.resolve.fallback.process = require.resolve('process/browser.js');

  // Ensure webpack resolves .js extensions for ESM modules
  config.resolve.extensionAlias = {
    '.js': ['.js', '.ts', '.tsx'],
    '.mjs': ['.mjs', '.mts']
  };

  // Configure module rules to handle .mjs files properly
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });

  return config;
};
