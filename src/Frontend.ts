import { writeFileSync } from 'node:fs'
import { option, argv } from './options'

import { Map } from './ludit/types'
import TreeNode from './ludit/TreeNode'
import Heap from './ludit/Heap'

import Preparser from './Preparser'

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
	heap: Heap;
	path: string | undefined;

	constructor(options: argv) {
		
		this.heap = new Heap();
		const { tokens } = Tokenizer.process(
			this.heap,
			options.argument || 'A'
		);
		this.profile = Profiler.process(tokens);
		this.expression = options.argument;
		this.options = options.queries;
		this.tree = Parser.makeTree(this.heap, tokens);
	}

	static findWithProp(arr: option[], type:string) {
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].type === type) {
				return i;
			}
		}
		return -1;
	}

	fromFile(filename: string) {
		// Load file	
		let file = Preparser.loadFile(filename); 

		this.path = Preparser.getPath(filename);

		// Remove file option so it does not run recursively
		this.options.splice(Frontend.findWithProp(this.options, 'file'), 1);
		
		file = Preparser.include(file, this.path)

		for (let i = 0; i < file.length; i++) {
			// Parse commments & prints
			let line = Preparser.filter(file[i]); 
			if (!line) continue; // Skip if empty line
	
			// Create tokens, profile and determine if line is a definition
			const { tokens, profile, isDef } = Tokenizer.process(this.heap, line);

			this.profile = profile; // Save profile (Variables used in line or definition)
			this.expression = line; // Save raw line

			// Create computation tree
			this.tree = Parser.makeTree(this.heap, tokens);

			// Dont compute and print if is a definition
			if (!isDef) this.main();
		}
		
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
			writeFileSync(filename, csv, 'utf-8');
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



