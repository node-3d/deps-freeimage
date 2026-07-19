import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const projectRoot = 'src/FreeImage';

const patchFile = async (path, replacements) => {
	const original = await readFile(path, 'utf8');
	let updated = original;
	for (const [from, to] of replacements) {
		updated = updated.replace(from, to);
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
	]);
};

const scriptPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';

if (import.meta.url === scriptPath) {
	await patchFreeImageSources();
}
