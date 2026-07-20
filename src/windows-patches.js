import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { patchFreeImageSources } from './source-patches.js';

const projectRoot = 'src/FreeImage';

const replaceAll = (text, replacements) => {
	let result = text;
	for (const [from, to] of replacements) {
		result = result.replaceAll(from, to);
	}
	return result;
};

const hasArm64Block = (text, tagName, config) => {
	const condition = `'\\$\\(Configuration\\)\\|\\$\\(Platform\\)'=='${config}\\|ARM64'`;
	const blockPattern = new RegExp(`<${tagName}\\b[^>]*Condition="${condition}"`, 'u');

	return blockPattern.test(text);
};

const cloneBlocks = (text, tagName) => {
	const blockPattern = new RegExp(
		`(<${tagName}[^>]*Condition="'\\$\\(Configuration\\)\\|\\$\\(Platform\\)'=='(Debug|Release)\\|x64'"[^>]*>[\\s\\S]*?<\\/${tagName}>)`,
		'gu',
	);

	return text.replace(blockPattern, (block, _match, config) => {
		if (hasArm64Block(text, tagName, config)) {
			return block;
		}

		const armBlock = replaceAll(block, [
			['|x64', '|ARM64'],
			['>x64<', '>ARM64<'],
			['>X64<', '>ARM64<'],
			['MachineX64', 'MachineARM64'],
			[String.raw`Dist\x64`, String.raw`Dist\ARM64`],
			[
				'<WarningLevel>Level3</WarningLevel>',
				'<WarningLevel>TurnOffAllWarnings</WarningLevel>',
			],
			[
				'<WarningLevel>Level4</WarningLevel>',
				'<WarningLevel>TurnOffAllWarnings</WarningLevel>',
			],
			[
				'<RandomizedBaseAddress>false</RandomizedBaseAddress>',
				'<RandomizedBaseAddress>true</RandomizedBaseAddress>',
			],
		]);

		return `${block}\n  ${armBlock}`;
	});
};

const hasArm64ProjectConfiguration = (text, config) => {
	const blockPattern = new RegExp(`<ProjectConfiguration Include="${config}\\|ARM64">`, 'u');

	return blockPattern.test(text);
};

const cloneProjectConfigurations = (text) => {
	const blockPattern =
		/(<ProjectConfiguration Include="(Debug|Release)\|x64">[\s\S]*?<\/ProjectConfiguration>)/gu;

	return text.replace(blockPattern, (block, _match, config) => {
		if (hasArm64ProjectConfiguration(text, config)) {
			return block;
		}

		const armBlock = replaceAll(block, [
			['|x64', '|ARM64'],
			['>x64<', '>ARM64<'],
		]);

		return `${block}\n    ${armBlock}`;
	});
};

const patchArm64Project = async (path) => {
	const original = await readFile(path, 'utf8');
	let updated = cloneProjectConfigurations(original);

	updated = cloneBlocks(updated, 'PropertyGroup');
	updated = cloneBlocks(updated, 'ImportGroup');
	updated = cloneBlocks(updated, 'ItemDefinitionGroup');

	if (updated !== original) {
		await writeFile(path, updated);
	}
};

const patchArm64Projects = async (dir) => {
	const entries = await readdir(dir, { withFileTypes: true });

	await Promise.all(
		entries.map(async (entry) => {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) {
				await patchArm64Projects(path);
			} else if (entry.name.endsWith('.vcxproj')) {
				await patchArm64Project(path);
			}
		}),
	);
};

const buildPlatform = process.argv[2] ?? '';

await patchFreeImageSources();

if (buildPlatform.toUpperCase() === 'ARM64') {
	await patchArm64Projects(projectRoot);
}
