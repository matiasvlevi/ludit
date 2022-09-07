import { Heap } from '../Heap'

import { attribute } from '../types'
import { isAttribute, ATTRIBUTES } from './index'

export function handleAttributes(
  heap: Heap,
  exp: string[],
  currentLine: number,
  currentChar: number
):number {
  let attributes: attribute[] = [];
  let i = currentChar+1;

  while(
    isAttribute(exp[i]) &&
    i < exp.length
  ) {
    attributes.push(ATTRIBUTES[exp[i]]);
    i++; 
  }

  heap.setAttributes(currentLine, attributes);
  return i;
}
