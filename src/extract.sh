(
	cd src

	rm -rf build
	rm -rf FreeImage
	rm -rf FreeImage-build-*

	mkdir -p build
	git clone --depth 1 -b v4.2.0 https://github.com/agruzdev/FreeImageRe.git FreeImage
)
