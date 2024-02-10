# This command should be run on CI/Netlify enviroment!
# If you really wanted to run it, run it on the root.

rm -rf dist-temp
rm -rf dist
rm -rf .parcel-cache

cp -r web/ dist-temp/

npm i
pip install -r tools/ci/requirements.txt

python tools/ci/cdn_to_local.py
python tools/merge_out.py	# On previews, attempt to merge patches
npx parcel build dist-temp/index.html dist-temp/**.html --dist-dir "dist" --no-source-maps --no-content-hash

rm -rf dist-temp

cp -r web/_img/ dist/
cp web/atlas.json dist/
cp web/*.txt dist/
cp web/_headers dist/
cp web/favicon.ico dist/
cp web/sw.js dist/