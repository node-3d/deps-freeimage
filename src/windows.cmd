@echo off
setlocal

if "%BUILD_PLATFORM%"=="" set BUILD_PLATFORM=x64
if "%PLATFORM_TOOLSET%"=="" set PLATFORM_TOOLSET=v143

node src\windows-patches.js %BUILD_PLATFORM% || exit /b 1

msbuild /p:Platform=%BUILD_PLATFORM% /p:Configuration=Release /p:PlatformToolset=%PLATFORM_TOOLSET% src\FreeImage\FreeImage.2013.vcxproj || exit /b 1

if not exist src\build mkdir src\build

copy /y src\FreeImage\Dist\%BUILD_PLATFORM%\FreeImage.dll src\build\FreeImage.dll || exit /b 1
copy /y src\FreeImage\Dist\%BUILD_PLATFORM%\FreeImage.lib src\build\FreeImage.lib || exit /b 1
