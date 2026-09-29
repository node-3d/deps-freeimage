import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import { getPlatform } from '@node-3d/addon-tools';

// oxlint-disable-next-line typescript/strict-void-return
const exec = promisify(execCb);
const platform = getPlatform();

const fail = (error: unknown): never => {
	console.error(error);
	process.exit(-1);
};

try {
	console.log('FreeImage Build Started');
	await exec('node src/source-patches.ts --format');
	const { stderr } = await exec(`sh src/${platform}.sh`);
	if (stderr) {
		console.error(stderr);
	}
	console.log('FreeImage Build Finished');
	console.log('-------------------');
} catch (error) {
	fail(error);
}
