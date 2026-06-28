import { install } from '@node-3d/addon-tools';

const prefix = 'https://github.com/node-3d/deps-freeimage/releases/download';
const tag = '7.0.0';

await install(`${prefix}/${tag}`);
