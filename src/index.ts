console.time();
import { Launcher } from './step';

import './step/definition';

const filePath: string | undefined = process.argv[2] ?? process.env["FEAT_PATH"];

if (filePath) {
    void Launcher.run(filePath);
    process.exitCode = 0;
} else {
    console.error('Missing target feat directory, provide it by argument or envvar "FEAT_PATH"');
    process.exitCode = 1;
}

console.timeEnd();

