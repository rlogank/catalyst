const catalyst-componentsPreset = require('@bigcommerce/catalyst-components/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [catalyst-componentsPreset],
  content: ['./stories/**/*.{ts,tsx}', './node_modules/@bigcommerce/catalyst-components/src/**/*.{ts,tsx}'],
  plugins: [],
};

module.exports = config;
