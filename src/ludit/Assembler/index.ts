import { makeTree } from "./makeTree";
import {
  getArgs,
  getPriorityOperator,
  setFunctionScope,
} from "./methods";

/**
* The Assembler assembles parsed Tokens into a Tree of Tokens
*
* All methods are static, this class is used as a namespace
*/
export default class Assembler {
  /*
  * File methods
  */
  public static makeTree = makeTree;
  public static getArgs = getArgs;
  public static setFunctionScope = setFunctionScope;
  public static getPriorityOperator = getPriorityOperator;
}
