(
	cd src/FreeImage
	
	export SDKROOT="$(xcrun --show-sdk-path)"
	export MACOSX_DEPLOYMENT_TARGET=13.5
	make -f Makefile.osx \
		CPP_X86_64='clang++ -w' \
		CC_X86_64='clang -w' \
		COMPILERFLAGS_X86_64='-arch x86_64 -mmacosx-version-min=13.5 -D__ANSI__ -DDISABLE_PERF_MEASUREMENT' \
		LIBRARIES_X86_64="-mmacosx-version-min=13.5 -flat_namespace -install_name @rpath/freeimage.dylib -Wl,-syslibroot ${SDKROOT}" \
		INCLUDE_X86_64="-isysroot ${SDKROOT}" \
		libfreeimage-3.18.0.dylib-x86_64 \
		>/dev/null
	
)

mv src/FreeImage/libfreeimage-3.18.0.dylib-x86_64 src/build/freeimage.dylib
