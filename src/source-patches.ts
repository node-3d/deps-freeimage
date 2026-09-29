import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('FreeImage/', import.meta.url));
const patchArgs = new Set(process.argv.slice(2));
const patchFormat = patchArgs.size === 0 || patchArgs.has('--format');
const patchWebp = patchArgs.size === 0 || patchArgs.has('--webp');
const patchYato = patchArgs.size === 0 || patchArgs.has('--yato');

const replace = async (
	relativePath: string,
	before: string,
	after: string,
	required = true,
): Promise<void> => {
	const filePath = path.join(root, relativePath);
	let source = '';

	try {
		source = await fs.readFile(filePath, 'utf8');
	} catch (error) {
		if (required) {
			throw error;
		}
		return;
	}

	source = source.replaceAll('\r\n', '\n');

	if (after && source.includes(after)) {
		return;
	}

	if (!source.includes(before)) {
		throw new Error(`Unable to patch ${relativePath}`);
	}

	await fs.writeFile(filePath, source.replace(before, after));
};

if (patchFormat) {
	await replace(
		'Source/FreeImage/Plugin.cpp',
		'#include <format>\n\n#include <filesystem>',
		'#include <filesystem>\n#include <sstream>',
	);

	await replace(
		'Source/FreeImage/Plugin.cpp',
		'\t\treturn std::format(".fitmp{:x}", static_cast<uint32_t>(std::rand()));',
		[
			'\t\tstd::ostringstream suffix;',
			'\t\tsuffix << ".fitmp" << std::hex << static_cast<uint32_t>(std::rand());',
			'\t\treturn suffix.str();',
		].join('\n'),
	);

	await replace('Source/Metadata/FIRational.cpp', '#include <format>\n', '#include <string>\n');

	await replace(
		'Source/Metadata/FIRational.cpp',
		'        s = std::format("{}/{}", _numerator, _denominator);',
		'\t\ts = std::to_string(_numerator) + "/" + std::to_string(_denominator);',
	);
}

if (patchWebp) {
	await replace(
		'cmake/dependency.webp.cmake',
		[
			'    URL "https://chromium.googlesource.com/webm/libwebp/+archive/4fa21912338357f89e4fd51cf2368325b59e9bd9.tar.gz"   #v1.6.0',
			"    # googlesource can't provide stable hash, so ignore hash check",
		].join('\n'),
		[
			'    URL "https://github.com/webmproject/libwebp/archive/refs/tags/v1.6.0.tar.gz"',
			'    URL_HASH SHA256=93a852c2b3efafee3723efd4636de855b46f9fe1efddd607e1f42f60fc8f2136',
		].join('\n'),
	);
}

if (patchYato) {
	await replace(
		'dependencies/yato/source/include/yato/prerequisites.h',
		'#if defined(__x86_64__) || defined(_M_X64) || defined(__aarch64__)',
		'#if defined(__x86_64__) || defined(_M_X64) || defined(__aarch64__) || defined(_M_ARM64) || defined(_M_ARM64EC)',
		false,
	);
}
