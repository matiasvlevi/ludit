import { writeFileSync } from 'node:fs'
import { option, argv } from './options'

import { queries as QUERIES } from './options/queries'

import { Map } from './ludit/types'
import TreeNode from './ludit/TreeNode'
import Heap from './ludit/Heap'

import Token from './ludit/Token'
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
	options: Map<option>;
	expression: string;
	heap: Heap;
	path: string | undefined;

	constructor(options: argv) {
		
		this.heap = new Heap();
		this.tree = new TreeNode(
			new Token('','',-1,-1),
			-1,
			new Token('','',-1,-1),
			new Token('','',-1,-1)
		)

		this.profile = '';
		this.expression = options.argument;
		this.options = options.queries;	

		// Run inline if no file was specified
		if (!this.options['file']) {
			// Show help if no options specified
			if (this.expression.length <= 0) {
				this.options['help'] = {
					requireParam: false,
					action: QUERIES.help.action,
					type: 'option', param: '' 
				};
				this.main();
				return;
			};

			this.inline(options);
		
		} else this.main();
	}

	inline(options: argv) {
		let err = { 
			line: 0,
			char: 0,
			text: this.expression 
		};
		const { tokens, profile } = Tokenizer.process(
			this.heap,
			this.expression || 'A', err
		);

		this.profile = Profiler.process(tokens);
	
		this.tree = Parser.makeTree(
			this.heap, tokens,
			profile, err
		);

		this.main();
	}

	static findWithProp(queries: Map<option>, type:string) {
		let arr = Object.values(queries);
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
		let fileLineNb = file.length;
		let includeLineNb = 0;

		this.path = Preparser.getPath(filename);

		// Remove file option so it does not run recursively
		delete this.options['file'];	
	
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

	// REMOVE THIS
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

	printSingle() {
		console.log(
			`${this.expression} = `+
			`\x1b[33m${+Processor.calculate(this.tree, this.profile, [])}\x1b[0m`
		);
	}

	// Calculate a truth table 
	run() {
		// Run specific function call
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
		if (Object.keys(this.options).length === 0) this.run();
		for (let query in this.options) {
			if (
				this.options[query].requireParam && 
				this.options[query].param === undefined
			) continue; 
			if (
				this.options[query].param !== undefined
			) {
				this.options[query].action(
					this,
					this.options[query].param || ''	
				);
			}
		}
	}

	// Generate binary incrementation based on a length
	static binaryCases(n: number) {
		let result = [];
		for (let y = 0; y < Math.pow(2, n); y++) {
			let combo = [];
			for (let x = 0; x < n; x++) 
				combo.push((y >> x) & 1);
					
			result.push(combo.reverse());
		}
		return result;
	}
}



