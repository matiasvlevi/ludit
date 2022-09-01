import { Map } from './ludit/types'
import TreeNode from './ludit/TreeNode'
import util from 'util'

import {
	Tokenizer,
	Parser,
	Profiler,
	Processor
} from './ludit'

export default class Frontend {
	
	profile: string;
	tree: TreeNode;

	constructor(equation:string) {
		const tokens = Tokenizer.process(equation);
		this.profile = Profiler.getOrder(tokens);
		this.tree = Parser.makeTree(tokens);
	}

	runSingle(_input: string) {
		const input = _input.split('').map(x => +x);
		const output = +Processor.calculate(this.tree, this.profile, input);

		console.log(util.inspect(this.tree, {depth: null, colors: true}))
		console.log(output)
	}

	run() {
		const cases = Frontend.binaryCases(this.profile.length);
		let output:Map<number>[] = [];
		
		for (let i = 0; i < cases.length; i++) {

			let row:Map<number> = {}; 
			for (let j = 0; j < this.profile.length; j++) {
				row[this.profile[j]] = cases[i][j];			
			}
			row.out = +Processor.calculate(this.tree, this.profile, cases[i]);
			output.push(row);
		}

		console.table(output);
		return output;
	}

	static binaryCases(n: number) {
		let result = [];
		for (let y = 0; y < Math.pow(2, n); y++) {
			let combo = [];
			for (let x = 0; x < n; x++) {
				if ((y >> x) & 1)
					combo.push(1);
				else
					combo.push(0);
			}	
			result.push(combo.reverse());
		}
		return result;
	}
}



