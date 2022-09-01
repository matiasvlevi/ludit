import fs from 'node:fs'
import { option, argv } from './options'

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
	options: any[];
	expression: string;

	constructor(options:argv) {
		const tokens = Tokenizer.process(
			options.argument
		);
		this.expression = options.argument;
		this.options = options.queries;
		this.profile = Profiler.getOrder(tokens);
		this.tree = Parser.makeTree(tokens);
	}

	static replaceAll(content: string, char:string, rep:string) {
		while(content.includes(char)) {
			content = content.replace(char, rep);
		}
		return content;
	}

	static applyValues(expression: string, values: string, profile: string) {
		for (let i = 0; i < profile.length; i++) {
			expression = Frontend.replaceAll(expression, profile[i], values[i])	
		}
		return expression;
	}

	// Calculate a single case
	runSingle(_input: string) {
		const input = _input.split('').map(x => +x);
		const output = +Processor.calculate(this.tree, this.profile, input);

		console.log(`${Frontend.applyValues(
			this.expression,
			_input,
			this.profile
		)} = \x1b[33m${output}\x1b[0m`);
	}

	// Calculate a truth table 
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

	save(filename: string) {
		const cases = Frontend.binaryCases(this.profile.length);
		let csv =`${this.profile.split('').join(',')},Out\n`;
		for (let i = 0; i < cases.length; i++) {
			for (let j = 0; j < this.profile.length; j++) {
				csv += `${cases[i][j]},`;			
			}
			csv += +Processor.calculate(this.tree, this.profile, cases[i]);
			csv += '\n';
		}
		process.stdout.write(csv);
		if (filename !== undefined)
			fs.writeFileSync(filename, csv, 'utf-8');
	}

	main() {
		if (this.options.length === 0) this.run();
		for (let option of this.options) {
			if (
				option.requireParam && 
				option.param === undefined
			) continue; 
			option.action(
				this,
				option.param	
			);
		}
	}

	// Generate binary incrementation based on a length
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



