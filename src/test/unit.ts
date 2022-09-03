
type testfunc = () => boolean;

export default class UnitTester {

	count: number;
	failedCount: number;

	constructor() {
		this.count = 0;
		this.failedCount = 0;
	}

	test(name: string, action: testfunc) {

		let success: boolean = action();

		let state = '\x1b[91mX\x1b[0m';
		if (success) state = '\x1b[92mO\x1b[0m'
		else this.failedCount++;
		
		this.count++;

		console.log(`${this.count} [${state}] ${name}`);
	}

	end() {
		if (this.failedCount === 0)  
			console.log(`\x1b[92mSuccess!\x1b[0m`);
		else 
			console.log(`\x1b[91m ${this.failedCount}/${this.count} Failed\x1b[0m`);
	}
}

