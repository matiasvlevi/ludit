import { Map } from '../types'

/**
*
*/
function sortString(profile: string[]):string {
	return profile.sort().join('');
}

/**
* replaceAll occurences of a character in a string
*
*   @param content - the input string
*   @param seg - the string segment to replace
*   @param rep - the string segment to replace `seg` with
*
*   @returns the string with replaced segments  
*/ 
function replaceAll(
  content: string,
  seg:string,
  rep:string
):string {
	while(content.includes(seg))
		content = content.replace(seg, rep);
	
  return content;
}

/**
* replace remove whitespaces in a given string
*
*   @param content - the input string  
*
*   @returns the string with no whitespace
*/ 
function removeWhiteSpace(content: string):string {
	return replaceAll(content, ' ', '');
}

/**
* create a whitespace string
*
*   @param length - the length of the whitespace string
*
*   @returns the whitespace string  
*/ 
function whitespace(length: number):string {
	return new Array(length).fill(' ').join('');
}

/**
* remove duplicate characters in a string
*
*   @param text - the input string
*
*   @returns the string with no duplicate values
*/
function removeDuplicates(text: string):string {
	let ans = '';
	let obj:Map<boolean> = {};
	
  for (let i = 0; i < text.length; i++) {
		obj[text[i]] = true;
	}

  for (let key in obj) {
		ans += key;
	}
	
  return ans;
}

/**
* Generate binary incrementation based on a length
* 
*   @param n - the length of the binary cases 
* 
*   @returns all the binary cases 
*/ 
function binaryCases(n: number):number[][] {
	let result = [];
	for (let y = 0; y < Math.pow(2, n); y++) {
		let combo = [];
		for (let x = 0; x < n; x++) 
			combo.push((y >> x) & 1);
				
		result.push(combo.reverse());
	}
	return result;
}

/**
* get a range of ASCII characters in a string
*
*   @param min - begining of the range
*   @param max - end of the range
*
*   @returns the ascii string
*/ 
function getASCII(min: number, max: number):string {
	let alpha = '';
	for (let i = min; i < max; i++)
		alpha += String.fromCharCode(i);

  return alpha;
}

export default { 
  replaceAll,
  binaryCases,
  getASCII,
  removeWhiteSpace,
  whitespace,
  removeDuplicates,
  sortString
}
