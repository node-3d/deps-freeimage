target="$1"
osx_arch="${2:-}"
build_dir="FreeImage-build-$target"
osx_args=""

if [ -n "$osx_arch" ]; then
	osx_args="-DCMAKE_OSX_ARCHITECTURES=$osx_arch -DCMAKE_OSX_DEPLOYMENT_TARGET=13.5"
fi

(
	cd src

	cmake -S FreeImage -B "$build_dir" \
		-DCMAKE_BUILD_TYPE=Release \
		-DCMAKE_POSITION_INDEPENDENT_CODE=ON \
		-DFREEIMAGE_COLORORDER=BGR \
		-DFREEIMAGE_WITH_LIBHEIF=OFF \
		-DFREEIMAGE_WITH_LIBJPEGXL=OFF \
		-DFREEIMAGE_WITH_PYTHON_BINDINGS=OFF \
		-DFREEIMAGE_BUILD_TESTS=OFF \
		$osx_args

	cmake --build "$build_dir" --config Release --target YATO --parallel
	node source-patches.js

	cmake --build "$build_dir" --config Release --target FreeImage --parallel

	if [ "$(uname -s)" = "Darwin" ]; then
		cp "$build_dir/bin/libFreeImage.dylib" build/freeimage.dylib
		install_name_tool -id @rpath/freeimage.dylib build/freeimage.dylib
	else
		cp "$build_dir/bin/libFreeImage.so" build/libFreeImage.so
		cp "$build_dir/bin/libFreeImage.so" build/libfreeimage.so.3
	fi
)
