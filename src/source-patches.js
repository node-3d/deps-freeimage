import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('FreeImage/', import.meta.url));

const replace = async (relativePath, before, after, required = true) => {
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

	if (after && source.includes(after)) {
		return;
	}

	if (!source.includes(before)) {
		throw new Error(`Unable to patch ${relativePath}`);
	}

	await fs.writeFile(filePath, source.replace(before, after));
};

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

await replace(
	'dependencies/yato/source/include/yato/prerequisites.h',
	'#if defined(__x86_64__) || defined(_M_X64) || defined(__aarch64__)',
	'#if defined(__x86_64__) || defined(_M_X64) || defined(__aarch64__) || defined(_M_ARM64) || defined(_M_ARM64EC)',
	false,
);
