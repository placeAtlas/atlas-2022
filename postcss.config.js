const plugins = [];

if (process.env.NODE_ENV === "production") {
	plugins["@fullhuman/postcss-purgecss"] = {
			content: [
				'./dist-temp/*.{html,js,svg}', 
				'./dist-temp/**/*.{html,js,svg}' 
			]
		}
	}

module.exports = {
	plugins
};