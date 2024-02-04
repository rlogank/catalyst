const catalyst-componentsPreset = require('@bigcommerce/catalyst-components/tailwind-config');

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [catalyst-componentsPreset],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './node_modules/@bigcommerce/catalyst-components/src/**/*.{ts,tsx}',
  ],
  plugins: [require('@tailwindcss/container-queries')],
};

module.exports = config;
