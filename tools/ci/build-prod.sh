# This command should be run on CI/Netlify enviroment!
# If you really wanted to run it, run it on the root.

rm -rf dist-temp
rm -rf dist
cp -r web/ dist-temp/
cp tools/ci/postcss.config.js ./
cp tools/ci/package.json ./
npm i
python tools/ci/cdn-to-local.py
npx parcel build dist-temp/index.html dist-temp/**.html --dist-dir "dist" --no-source-maps --no-content-hash
mkdir dist/_img
cp -r dist-temp/_img/canvas/ dist/_img/canvas/
cp dist-temp/atlas.json dist
rm -rf dist-temp
rm -rf postcss.config.js