echo "# Ensuring ./dist directory exists..."

mkdir -p foo ./dist

echo "# Minifying paranoid.js using Uglifyjs2..."

./node_modules/.bin/uglifyjs ./src/paranoid.js -o ./dist/paranoid.min.js \
  --mangle --comments --source-map ./dist/paranoid.min.js.map
