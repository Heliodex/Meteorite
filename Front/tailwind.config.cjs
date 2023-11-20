/** @type {import("tailwindcss").Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./src/**/*.{html,js,svelte,ts}",
		require("path").join(
			require.resolve("@skeletonlabs/skeleton"),
			"../**/*.{html,js,svelte,ts}",
		),
	],
	theme: {
		extend: {
			transitionProperty: {
				width: "width",
			},
		},
	},
	safelist: [
		"float-left",
		"float-right",
		"h-5",
		"w-5", // status bubbles
	],
	plugins: [
		require("@tailwindcss/forms"),
		require("@tailwindcss/typography"),
		...require("@skeletonlabs/skeleton/tailwind/skeleton.cjs")(),
	],
}
