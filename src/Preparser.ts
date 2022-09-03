import fs from 'node:fs'


import { ErrorHandler, error } from './ludit/ErrorHandler'

import { Map } from './ludit/types'

type preParserKeyword = {
	type: string,
	action: (line: string, e:error) => string[]
}

export default class Preparser {
	constructor() {};

	static KEYWORD: Map<preParserKeyword> = {
		'include': {
			type: 'include',
			action: (path: string, e: error): string[] => {
				return Preparser.loadFile(path, e);
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
		mainpath:string,
		j:number = 0
	): string[] {
		let includes:string[] = [];
		let length = file.length-1;
		
		for (let i = length; i >= 0; i--) {

			// Reset main path for each main include
			let path = mainpath;

			let { include, newPath } = Preparser.checkInclude(
				path,
				file[i],
				{ line: i+1, char: 9, text: file[i]}
			);
			
			if (include.length !== 0) {
				// If file was included, set path to the new included file
				path = newPath;

				// Remove include keyword
				file.splice(i, 1); 

				// Look for includes in included file
				if (Preparser.includesAnInclude(include)) {
					let nested =  Preparser.include([...include], path, j+1);	
					include = nested
				}

				includes = include.concat(file);

				file = includes;
				i = file.length-1;	
			}
		}
		return includes;
	}

	static includesAnInclude(file: string[]): boolean {
		for (let i = 0 ; i < file.length; i++) {
			if (
				file[i].includes('include') &&
				!(file[i].includes('#') ||
				file[i].includes('-'))
			) {
				return true
			}
		}	
		return false;

	}

	static checkInclude(
		path:string,
		line: string,
		errorInfo:error
	): any {

		let words = line.split(' ');
		if (words[0].includes('#')) return { include:[], newPath:path }; // ignore comments
		if (Preparser.KEYWORD[words[0]] !== undefined) {
			let includepath = 
				Preparser.evalPath(Preparser.parseQuotes(words[1]), path)

			path = Preparser.getPath(includepath);	
			
			return { 
				include: Preparser.KEYWORD[words[0]].action(
					`${includepath}.ludi`,
					errorInfo	
				),
				newPath: path
			}
		}

		return { include: [], newPath:path };
	}

	static evalPath(file:string, path:string) {
		if (file[0] !== '.') {
			if (file[0] === '/') {	
				// Global path
				return `${file}`	
			} else { 
				if (
					process.env.LUDIT_PATH === undefined ||
					!fs.existsSync(`${process.env.LUDIT_PATH}/`)
				) {
					ErrorHandler.envError('LUDIT_PATH');
				}	
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
			return `${Preparser.resolve(path, count)}${mfile}`
		} else {
			file = file.replace('.', path)
		}
		return file;
	}

	static loadFile(path: string, e:error | undefined = undefined) {
		if (!fs.existsSync(path)) {
			ErrorHandler.includeNotFound(path, e);

			return [];
		}
		console.log(path)
		return fs.readFileSync(path, 'utf-8').split('\n')
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
