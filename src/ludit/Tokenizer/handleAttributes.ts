import { Heap } from '../Heap'

import { attribute } from '../types'
import { isAttribute, getAttribute, isNumeral } from './index'

export function handleAttributes(
  heap: Heap,
  exp: string[],
  currentLine: number,
  currentChar: number
):number {
  let attributes: attribute[] = [];
  let i = currentChar+1;
  let numericAttribute = '';

  while(
    isAttribute(exp[i]) &&
    i < exp.length
  ) {
    if (isNumeral(exp[i])){
      numericAttribute += exp[i];
    } else { 
      attributes.push(getAttribute(exp[i]));
    }
    i++; 
  }
  if (numericAttribute.length > 0) {
    attributes.push(getAttribute(numericAttribute));
  }

  heap.setAttributes(currentLine, attributes);
  return i;
}
