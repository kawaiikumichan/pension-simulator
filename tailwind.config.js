// C:\src\svelte-pension-tool\tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // ★重要: TailwindがCSSクラスを探すファイルパスを指定
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    "./src/routes/**/*.svelte",
    "./src/lib/components/**/*.svelte",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};