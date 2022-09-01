import Frontend from './Frontend'

const frontend = new Frontend(process.argv[2]);

if (process.argv[3] !== undefined) {
	frontend.runSingle(process.argv[3]);
} else {
	frontend.run();
}
