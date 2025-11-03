// C:\src\svelte-pension-tool\vite.config.mjs
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    // ★修正点: 外部CSSの変更を監視する設定を追加
    server: {
        watch: {
            ignored: ['**/*.css'], // デフォルトの無視設定を一時的に無効化
        },
    },
    css: {
         // プリプロセッサが有効か確認
    }
});