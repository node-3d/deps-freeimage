@echo off
setlocal

if "%BUILD_PLATFORM%"=="" set BUILD_PLATFORM=x64
set BUILD_DIR=src\FreeImage-build-%BUILD_PLATFORM%

cmake -S src\FreeImage -B %BUILD_DIR% -A %BUILD_PLATFORM% ^
	-DCMAKE_CONFIGURATION_TYPES=Release ^
	-DFREEIMAGE_COLORORDER=BGR ^
	-DFREEIMAGE_WITH_LIBHEIF=OFF ^
	-DFREEIMAGE_WITH_LIBJPEGXL=OFF ^
	-DFREEIMAGE_WITH_PYTHON_BINDINGS=OFF ^
	-DFREEIMAGE_BUILD_TESTS=OFF || exit /b 1

if /I "%BUILD_PLATFORM%"=="ARM64" (
	cmake --build %BUILD_DIR% --config Release --target YATO --parallel || exit /b 1
	node src\source-patches.js --yato || exit /b 1
)

if /I "%BUILD_PLATFORM%"=="ARM64EC" (
	cmake --build %BUILD_DIR% --config Release --target YATO --parallel || exit /b 1
	node src\source-patches.js --yato || exit /b 1
)

cmake --build %BUILD_DIR% --config Release --target FreeImage --parallel || exit /b 1

if not exist src\build mkdir src\build

if exist %BUILD_DIR%\bin\Release\FreeImage.dll copy /y %BUILD_DIR%\bin\Release\FreeImage.dll src\build\FreeImage.dll
if exist %BUILD_DIR%\bin\FreeImage.dll copy /y %BUILD_DIR%\bin\FreeImage.dll src\build\FreeImage.dll
if exist %BUILD_DIR%\bin\Release\FreeImage.lib copy /y %BUILD_DIR%\bin\Release\FreeImage.lib src\build\FreeImage.lib
if exist %BUILD_DIR%\bin\FreeImage.lib copy /y %BUILD_DIR%\bin\FreeImage.lib src\build\FreeImage.lib

if not exist src\build\FreeImage.dll exit /b 1
if not exist src\build\FreeImage.lib exit /b 1
