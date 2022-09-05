import { makeTree } from './makeTree'
import {
  setFunctionScope,
  getArgs,
  getPriorityOperator
} from './methods'

export default class Parser {

  /* 
  * File methods
  */
  public static makeTree = makeTree;
  public static getArgs = getArgs;
  public static setFunctionScope = setFunctionScope;
  public static getPriorityOperator = getPriorityOperator;

};
