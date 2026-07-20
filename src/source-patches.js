import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const projectRoot = 'src/FreeImage';

const patchFile = async (path, replacements) => {
	const original = await readFile(path, 'utf8');
	let updated = original;
	for (const [from, to] of replacements) {
		if (!updated.includes(to)) {
			updated = updated.replace(from, to);
		}
	}

	if (updated !== original) {
		await writeFile(path, updated);
	}
};

export const patchFreeImageSources = async () => {
	await Promise.all([
		patchFile(join(projectRoot, 'Source/OpenEXR/IlmImf/ImfAttribute.cpp'), [
			[
				'struct NameCompare: std::binary_function <const char *, const char *, bool>\n{',
				'struct NameCompare\n{',
			],
		]),
		patchFile(join(projectRoot, 'Source/LibPNG/pngpriv.h'), [
			[
				'defined(THINK_C) || defined(__SC__) || defined(TARGET_OS_MAC)',
				'defined(THINK_C) || defined(__SC__)',
			],
		]),
		patchFile(join(projectRoot, 'Source/ZLib/zutil.h'), [
			['#if defined(MACOS) || defined(TARGET_OS_MAC)', '#if defined(MACOS)'],
		]),
		patchFile(join(projectRoot, 'Source/ZLib/gzlib.c'), [
			[
				'#include "gzguts.h"\n',
				'#include "gzguts.h"\n\n#if defined(__APPLE__)\n#  include <unistd.h>\n#endif\n',
			],
		]),
		patchFile(join(projectRoot, 'Source/OpenEXR/IlmImf/ImfSimd.h'), [
			[
				'#if defined __SSE2__ || (_MSC_VER >= 1300 && !_M_CEE_PURE)',
				'#if defined __SSE2__ || (defined(_MSC_VER) && _MSC_VER >= 1300 && !defined(_M_CEE_PURE) && (defined(_M_IX86) || defined(_M_X64) || defined(_M_AMD64)))',
			],
		]),
	]);
};

const scriptPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';

if (import.meta.url === scriptPath) {
	await patchFreeImageSources();
}
