import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execCb);

const {
	getPlatform,
} = await import('@node-3d/addon-tools');


const platform = getPlatform();


const fail = (error) => {
	console.error(error);
	process.exit(-1);
};


try {
	console.log('FreeImage Build Started');
	const { stderr } = await exec(`sh src/${platform}.sh`);
	if (stderr) {
		console.error(stderr);
	}
	console.log('FreeImage Build Finished');
	console.log('-------------------');
} catch (error) {
	fail(error);
}
