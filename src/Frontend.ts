import { writeFileSync } from 'node:fs'
import { option, argv } from './options'

import util from 'util'

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
	expression: string;
	options: any[];
	profile: string;
	heap: Heap;
	path: string|undefined;
	tree: TreeNode;
	
	constructor(options:argv) {
		this.heap = new Heap();
		const { tokens, profile } = Tokenizer.process(
			this.heap,
			options.argument || 'A',
			{ 
				line: 0,
				char: 0,
				text: options.argument
			}
		);
		
		this.expression = options.argument;
		this.options    = options.queries;
		this.profile    = Profiler.process(tokens);
		this.tree = Parser.makeTree(this.heap, tokens, profile, {
			line: 0,
			char: 0,
			text: this.expression
		});
	}
	
	static findWithProp(arr: option[], type:string) {
		for (let i = 0; i < arr.length; i++)
			if (arr[i].type === type) return i;
		return -1;
	}
	
	fromFile(filename: string) {
		// Load file	
		let file = Preparser.loadFile(filename); 
		let fileLineNb = file.length;
		let includeLineNb = 0;
		
		this.path = Preparser.getPath(filename);
		
		// Remove file option so it does not run recursively
		this.options.splice(Frontend.findWithProp(this.options, 'file'), 1);	
		
		// Handle included files
		if (Preparser.includesAnInclude(file)) {
			file = Preparser.include(file, this.path)
			includeLineNb = file.length - fileLineNb;
		}
		
		for (let i = 0; i < file.length; i++) {
			let currentLine = i+1 - includeLineNb;
			// Parse commments & prints
			let line = Preparser.filter(file[i]); 
			if (!line) continue; // Skip if empty line
			
			// Create tokens, profile and determine if line is a definition
			const { tokens, profile, isDef } = Tokenizer.process(
				this.heap,
				line,
				{ line: currentLine, char: -1, text: file[i]}
			);
			
			this.profile = profile; // Save profile (Variables used in line or definition)
			this.expression = line; // Save raw line
			
			// Create computation tree
			this.tree = Parser.makeTree(this.heap, tokens, profile, {
				line: currentLine,
				char: -1,
				text: file[i]
			});
			
			// Dont compute and print if is a definition
			if (!isDef) this.main();
		}
		
	}
	
	/**
	* Replaces all `seq` sequences in a string. (`seq` is intended to be a single character.)  
	* Created since not all Node versions support `String.prototype.replaceAll`.
	*/
	static replaceAll(content: string, seq:string, rep:string) {
		while (content.includes(seq))
			content = content.replace(seq, rep);
		return content;
	}
	
	static applyValues(expression: string, values: string, profile: string) {
		for (let i = 0; i < profile.length; i++) {
			expression = Frontend.replaceAll(expression, profile[i], values[i])	
		}
		return expression;
	}
	
	/** Calculates and prints a single case. */
	runSingle(_input: string) {
		const input = _input.split('').map(x => +x);
		const output = +Processor.calculate(this.tree, this.profile, input);

		console.log(`${Frontend.applyValues(
			this.expression,
			_input,
			this.profile
		)} = \x1b[33m${output}\x1b[0m`);
	}
	
	printSingle() {
		console.log(
			`${this.expression} = `+
			`\x1b[33m${+Processor.calculate(this.tree, this.profile, [])}\x1b[0m`
		);
	}
	
	/**
	* Calculates and prints a truth table.
	* @returns The generated
	*/
	run() {
		if (this.profile.length === 0) {
			this.printSingle();
			return;
		};
		
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
		if (!this.options.length) this.run();
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
	
	/**
	* Generates all the combination of bits for a given number of terms.
	* @param n The number of unique terms.
	*/
	static binaryCases(n: number) {
		let result = [];
		for (let y = 0; y < Math.pow(2, n); y++) {
			let combo = [];
			for (let x = 0; x < n; x++) combo.push((y >> x) & 1);
			result.push(combo.reverse());
		}
		return result;
	}
}



