import Preparser from './index'

import fs from 'node:fs'

import { error } from '../types'
import { ErrorHandler } from '../ErrorHandler'


/**
* checkInclude's return 
* 
*   @param include - The contents of the included file
*   @param newPath - The path of the included file, so its own includes can be paths relative to this file
*/ 
type checkIncludeReturn = {
  include: string[],
  newPath: string
}

/**
* create a path going back n directories
*
*   @param back - the number of directories to go back
*
*   @returns the path
*/
export function makeBackPath(back: number):string {
	let path = '';
	for (let i = 0; i < back; i++) {
		path += '../'
	}
	return path;
}

/**
* get path if you go back n directories
*
*   @param fullpath - The path to use
*   @param back - The number of directories to go back
*
*   @returns The backtracked path with
* 
*/ 
export function resolve(
  fullpath: string,
  back:number
):string {
	let spath = fullpath.split('/');
	if (spath.length < back+1) {
		return Preparser.makeBackPath(back+1-spath.length);	
	} else {
		return `${spath[spath.length-back-1]}/`
	}
}

/**
* get the directory of a file
* 
*   @param fullpath - Path with a file at the end
*
*   @returns The directory of the file 
*/
export function getPath(fullpath:string):string {
	// linux only
	let spath = fullpath.split('/')
	spath.pop();
	return spath.join('/')
}

/**
* get the content in between double quotes
*
* @returns the content 
*/ 
export function parseQuotes(text:string):string {
	return text.slice(1, text.length-1);
}

/**
* include a file, method is called when `include` keyword is found
*
*   @param file - The current file as an array of lines
*   @param mainpath - The path of the current file
*
*   @returns The file with the contents of the included file concatenated at the begining
*/ 
export function include(
	file: string[],
	mainpath:string,
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
			if (Preparser.containsInclude(include)) {
				let nested =  Preparser.include([...include], path);	
				include = nested
			}

			includes = include.concat(file);

			file = includes;
			i = file.length-1;	
		}
	}
	return includes;
}

/**
* Check whether or a file contains an include keyword
*
*   @param file - The file as an array of strings for each lines 
*
*   @returns whether or not the file contains an include keyword
*/
export function containsInclude(file: string[]): boolean {
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

/**
* Check for an include keyword in a line, and return the contents of the included file if exists.
*
*   @param path - path to the included file
*   @param line - line of text with which to look for an include
*   @param errorInfo - Error data in case one gets thrown
*  
*   @returns The included file's content and path
*/ 
export function checkInclude(
	path:string,
	line: string,
	errorInfo:error
): checkIncludeReturn {

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

/**
* convert a specified path to a path fs can understand  
* can do global paths, local paths and library paths
* 
*   @param file - The specified file path
*   @param path - The file including a file's path
*
*   @returns The path fs can understand
*/ 
export function evalPath(file:string, path:string):string {
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

  // Local path
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

/**
* load a file and separate lines to a string array
*
*   @param path - the file's path
*   @param e - Error data in case one gets thrown
*/ 
export function loadFile(
  path: string,
  e:error | undefined = undefined
):string[] {
	if (!fs.existsSync(path)) {
		ErrorHandler.includeNotFound(path, e);

		return [];
	}
	return fs.readFileSync(path, 'utf-8').split('\n')
}

/**
* ignore comments and return only non commented lines or line sections
*
*   @param line - A file line
* 
*   @return The line without comments, if undefined, the entire line is a comment
*/
export function handleComments(line: string): string | undefined {
	if (line.includes('#')) {
		line = line.slice(0, line.indexOf('#'))
		if (line.length === 0) return;
	}
	return line;
}

/**
* handle print statements
* 
*   @param line - A file line
*
*   @returns whether or not the line was a print statement
*/ 
export function handlePrints(line: string): boolean {
	if (line[0] === '-') {
		let title = line.slice(1, line.length)
		console.log(`\x1b[36m${title}\x1b[0m`);
		return true
	}
	return false;
}

/**
* filter file lines, remove comments and remove print statements
*
*   @param line - A file line
*
*   @returns the line without any comments or print statements   
*/ 
export function filter(line: string): string | undefined {
	let pline = Preparser.handleComments(line);
	if (!pline) return;
	if (!Preparser.handlePrints(pline)) return pline;
} 

