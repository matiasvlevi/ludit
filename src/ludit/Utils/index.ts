export { writeFileSync } from "node:fs";
import { Map } from "../types";

/**
* Sort a string alphabetically
*/
export function sortString(profile: string[]): string {
  return profile.sort().join("");
}

/**
* replaceAll occurences of a character in a string.
*
* @remark Some versions of nodejs don't provide `String.prototype.replaceAll` this is why this function exists
*
*   @param content - the input string
*   @param seg - the string segment to replace
*   @param rep - the string segment to replace `seg` with
*
*   @returns the string with replaced segments
*/
export function replaceAll(
  content: string,
  seg: string,
  rep: string,
): string {
  while (content.includes(seg)) {
    content = content.replace(seg, rep);
  }

  return content;
}

/**
* replace remove whitespaces in a given string
*
*   @param content - the input string
*
*   @returns the string with no whitespace
*/
export function removeWhiteSpace(content: string): string {
  return replaceAll(content, " ", "");
}

/**
* create a whitespace string
*
*   @param length - the length of the whitespace string
*
*   @returns the whitespace string
*/
export function whitespace(length: number): string {
  return new Array(length).fill(" ").join("");
}

/**
* remove duplicate characters in a string
*
*   @param text - the input string
*
*   @returns the string with no duplicate values
*/
export function removeDuplicates(text: string): string {
  let ans = "";
  const obj: Map<boolean> = {};

  for (let i = 0; i < text.length; i++) {
    obj[text[i]] = true;
  }

  for (const key in obj) {
    ans += key;
  }

  return ans;
}

/**
* Generate gray code sequence
*
*   @param n - The length of the gray code sequence
*/ 
export function grayCode(n:number):number[][] {
  if (n <= 0) return [];

  let ans: string[] = [];

  ans.push("0");
  ans.push("1");

  for (let i = 2; i < (1<<n); i = i<<1) {
    for (let j = i-1; j >= 0; j--) {
      ans.push(ans[j]);
    }

    for (let j = 0; j < i; j++) {
      //ans[j].unshift("0");
      ans[j] = "0" + ans[j];
    }

    for (let j = i; j < 2*i; j++) {
      //ans[j].unshift(1);
      ans[j] = "1" + ans[j];
    }
  }
  let arr = [];
  for (let i = 0; i < ans.length; i++) 
    arr.push(ans[i].split('').map(x => +x))
  
  return arr; 
}

/**
* Generate binary incrementation based on a length
*
*   @param n - the length of the binary cases
*
*   @returns all the binary cases
*/
export function binaryCases(
  n: number,
  reverse = true,
  max = -1
): number[][] {
  const result = [];
  
  let length = (max === -1) ?
    Math.pow(2, n) :
    Math.min(Math.pow(2, n), max)

  for (let y = 0; y < length; y++) {
    const combo = [];
    for (let x = 0; x < n; x++) {
      combo.push((y >> x) & 1);
    }

    result.push(
      (reverse) ? combo : combo.reverse()
    );
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
export function getASCII(min: number, max: number): string {
  let alpha = "";
  for (let i = min; i < max; i++) {
    alpha += String.fromCharCode(i);
  }

  return alpha;
}
