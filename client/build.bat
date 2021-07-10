rd build /s /q
mkdir build
mkdir build\lib
xcopy lib build\lib /s /e /y
xcopy src\html build /y
cd src\js
browserify Game.js -o ..\..\build\rl-min.js