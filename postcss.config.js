const plugins = [];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    require("@fullhuman/postcss-purgecss")({
      content: [
        './dist-temp/*.html', 
        './dist-temp/**/*.html', 
        './dist-temp/**/*.js',
        './dist-temp/*.svg', 
        './dist-temp/**/*.svg'
      ]
    })
  );
}

module.exports = {
  plugins
};