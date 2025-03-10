module.exports = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["../preset.js", "@storybook/addon-essentials"],

  framework: '@storybook/react-webpack5',
  docs: {
    autodocs: true
  }
};
