rm -rf build
mkdir build
mkdir build/lib
cp -R lib/* build/lib
cp src/html/* build
mkdir build/assets
cp -R assets/* build/assets
cd src/js
browserify Game.js -o ../../build/rl-min.js 