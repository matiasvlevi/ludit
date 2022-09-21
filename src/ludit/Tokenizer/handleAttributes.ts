import { Heap } from '../Heap'

import { attribute } from '../types'
import { isAttribute, getAttribute, isNumeral } from './index'

/**
* Handle the attributes specified for an expression
*
*   @param heap - The heap instance
*   @param exp - The expression as an array of characters
*   @param currentLine - The current line index
*   @param currentChar - The current char index
*
*   @returns the new position after the attributes 
*/ 
export function handleAttributes(
  heap: Heap,
  exp: string[],
  currentLine: number,
  currentChar: number
):number {
  let attributes: attribute[] = [];
  let i = currentChar+1;
  let numericAttribute = '';

  // Iterate until character is no longer an attribute
  while(
    isAttribute(exp[i]) &&
    i < exp.length
  ) {
    // If is numeral, add it to the numeral stream
    if (isNumeral(exp[i])){
      numericAttribute += exp[i];
    } else { 
      attributes.push(getAttribute(exp[i]));
    }
    i++; 
  }
  // Push numeral stream and get the attribute type
  if (numericAttribute.length > 0) {
    attributes.push(getAttribute(numericAttribute));
  }

  // Set the attribute
  heap.setAttributes(currentLine, attributes);
  return i;
}
