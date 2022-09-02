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


	static makeBackPath(back: number) {
		let path = '';
		for (let i = 0; i < back; i++) {
			path += '../'
		}
		return path;
	}

	static resolve(fullpath: string, back:number) {
		let spath = fullpath.split('/');
		if (spath.length < back+1) {
			return Preparser.makeBackPath(back+1-spath.length);	
		} else {
			return `${spath[spath.length-back-1]}/`
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

	static include(
		file: string[],
		path:string,
		j:number = 0
	): string[] {
		let includes:string[] = [];
		console.log(file)
		let length = file.length-1;
		for (let i = length; i >= 0; i--) {

			let include = Preparser.checkInclude(path, file[i]);
			if (include.length !== 0) {

				file.splice(i, 1); // Remove include
				

				console.log('file', file);

				console.log('include', include)

				includes = include.concat(file);

				file = includes;
				i = file.length-1;	
				
				console.log('newfile',i,  file)
			}
		}
		return includes;
	}

	static includesAnInclude(file: string[]): boolean {
	
		for (let i = 0 ; i < file.length; i++) {
			if (file[i].includes('include')) {
				return true
			}
		}	
		return false;

	}

	static checkInclude(path:string, line: string): string[] {
		let words = line.split(' ');

		if (Preparser.KEYWORD[words[0]] !== undefined) {
			let includepath = 
				Preparser.evalPath(Preparser.parseQuotes(words[1]), path)
				
			return Preparser.KEYWORD[words[0]].action(`${includepath}.ludi`);
		}

		return [];
	}

	static evalPath(file:string, path:string) {
		console.log(file, path)
		if (file[0] !== '.') {
			if (file[0] === '/') {	
				// Global path
				return `${file}`	
			} else {
				// Lib path
				return `${process.env.LUDIT_PATH}/${file}`
			}

		}

		let mfile = file
		if (mfile.includes('../')) {
			let count = 0;
			while (mfile.includes('../')) {
				mfile = mfile.replace('../', '');
				count++;
			} 
			console.log(count, mfile);
			return `${Preparser.resolve(path, count)}${mfile}`
		} else {
			file = file.replace('.', path)
		}
		return file;
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
