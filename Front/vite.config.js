import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite'
let url = 'http://localhost:80'

/** @type {import('vite').UserConfig} */
const deb = {
	target: url,
	changeOrigin: true
  }
const defaultconfig = {
	plugins: [sveltekit()],
	server: {
		proxy: {
		  '/login': deb,
		  '/api': deb,
		  '/games/': deb,
		  "/develop/": deb,
		  "/favicon": deb,
		  "/assets": deb,
		  "/settings/": deb,
		}
	  }
};

export default defineConfig(({ command, mode, ssrBuild }) => {
	if (command === 'serve') {
	  return {
		...defaultconfig
	  }
	} else {
	  // command === 'build'
	  return {
		// build specific config

		...{
			plugins: [sveltekit()]
			  }
		}

	  }
	}
)

//export default config;