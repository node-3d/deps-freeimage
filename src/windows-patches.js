import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = 'src/FreeImage';
const openExrAttributePath = join(projectRoot, 'Source/OpenEXR/IlmImf/ImfAttribute.cpp');

const replaceAll = (text, replacements) => {
	let result = text;
	for (const [from, to] of replacements) {
		result = result.replaceAll(from, to);
	}
	return result;
};

const cloneBlocks = (text, tagName) => {
	const blockPattern = new RegExp(
		`(<${tagName}[^>]*Condition="'\\$\\(Configuration\\)\\|\\$\\(Platform\\)'=='(Debug|Release)\\|x64'"[^>]*>[\\s\\S]*?<\\/${tagName}>)`,
		'gu',
	);

	return text.replace(blockPattern, (block) => {
		const armBlock = replaceAll(block, [
			['|x64', '|ARM64'],
			['>X64<', '>ARM64<'],
			['MachineX64', 'MachineARM64'],
			[String.raw`Dist\x64`, String.raw`Dist\ARM64`],
		]);

		return `${block}\n  ${armBlock}`;
	});
};

const patchOpenExr = async () => {
	const original = await readFile(openExrAttributePath, 'utf8');
	const updated = original.replace(
		'struct NameCompare: std::binary_function <const char *, const char *, bool>\n{',
		'struct NameCompare\n{',
	);

	if (updated !== original) {
		await writeFile(openExrAttributePath, updated);
	}
};

const patchArm64Project = async (path) => {
	const original = await readFile(path, 'utf8');
	if (original.includes('Release|ARM64')) {
		return;
	}

	let updated = original.replace(
		'    <ProjectConfiguration Include="Debug|x64">\n      <Configuration>Debug</Configuration>\n      <Platform>x64</Platform>\n    </ProjectConfiguration>',
		'    <ProjectConfiguration Include="Debug|x64">\n      <Configuration>Debug</Configuration>\n      <Platform>x64</Platform>\n    </ProjectConfiguration>\n    <ProjectConfiguration Include="Debug|ARM64">\n      <Configuration>Debug</Configuration>\n      <Platform>ARM64</Platform>\n    </ProjectConfiguration>',
	);

	updated = updated.replace(
		'    <ProjectConfiguration Include="Release|x64">\n      <Configuration>Release</Configuration>\n      <Platform>x64</Platform>\n    </ProjectConfiguration>',
		'    <ProjectConfiguration Include="Release|x64">\n      <Configuration>Release</Configuration>\n      <Platform>x64</Platform>\n    </ProjectConfiguration>\n    <ProjectConfiguration Include="Release|ARM64">\n      <Configuration>Release</Configuration>\n      <Platform>ARM64</Platform>\n    </ProjectConfiguration>',
	);

	updated = cloneBlocks(updated, 'PropertyGroup');
	updated = cloneBlocks(updated, 'ImportGroup');
	updated = cloneBlocks(updated, 'ItemDefinitionGroup');

	await writeFile(path, updated);
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

await patchOpenExr();

if (buildPlatform.toUpperCase() === 'ARM64') {
	await patchArm64Projects(projectRoot);
}
