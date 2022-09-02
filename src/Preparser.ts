import fs from 'node:fs'
import { Map } from './ludit/types'

type preParserKeyword = {
	type: string,
	action: (line: string) => string[]
}

export default class Preparser {
	constructor() {};

	static KEYWORD: Map<preParserKeyword> = {
		'include': {
			type: 'include',
			action: (path: string): string[] => {
				return Preparser.loadFile(path);
			}
		}
	}

	static getPath(fullpath:string) {
		// linux
		let spath = fullpath.split('/')
		spath.pop();
		return spath.join('/')
	}

	static parseQuotes(text:string) {
		return text.slice(1, text.length-1);
	}

	

	static include(file: string[], path:string) {
		let includes:string[] = [];
		for (let i = 0; i < file.length; i++) {
			let include = Preparser.checkInclude(path, file[i]);
			if (include.length !== 0) file.splice(i, 1)

			includes = includes.concat(include);	
		}
		return includes.concat(file);
	}
	static checkInclude(path:string, line: string): string[] {
		let words = line.split(' ');

		if (Preparser.KEYWORD[words[0]] !== undefined) {
			let includepath = Preparser.parseQuotes(words[1]).replace('.', `${path}`);
			return Preparser.KEYWORD[words[0]].action(`${includepath}.ludi`);
		}
		return [];
	}

	static loadFile(path: string) {
		return fs.readFileSync(path, 'utf-8').split('\n')
			.filter(l => l.length > 0)	   // Ignore blank lines	
	}

	static comments(line: string): string | undefined {
		if (line.includes('#')) {
			line = line.slice(0, line.indexOf('#'))
			if (line.length === 0) return;
		}
		return line;
	}

	static prints(line: string): boolean {
		if (line[0] === '-') {
			let title = line.slice(1, line.length)
			console.log(`\x1b[36m${title}\x1b[0m`);
			return true
		}
		return false;
	}

	static filter(line: string): string | undefined {
		let pline = Preparser.comments(line);
		if (!pline) return;
		if (!Preparser.prints(pline)) return pline;
	} 

}
