// C:\src\svelte-pension of -tool\svelte.config.js
import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// ★修正点: Tailwind CSS を PostCSS で処理するよう設定
	preprocess: preprocess({
		postcss: true
	}),
	
	kit: {
		adapter: adapter()
	}
};

export default config;