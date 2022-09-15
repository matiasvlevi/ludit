
import * as ErrorHandler from "../ErrorHandler";
import { 
  error,
  errorCall,
  attribute,
  attributes,
  Map,
  HeapSlot
} from "../types";

import {Token} from "../Token";
import {TreeNode} from "../TreeNode";

/**
* The heap stores the function definition's root TreeNodes, for later use.
* 
* it stores error data and errorCallbacks for the nodejs API
*
* it also stores line attributes
*/
export class Heap {

  /**
  * The stored function definitions
  */ 
  public data: Map<HeapSlot>;
  
  /**
  * The error data, used for the Nodejs api
  */ 
  public error: error | undefined;

  /**
  * The error callback, use for the Nodejs api
  */ 
  public errorCall: (errorCall|undefined);

  /**
  * The attributes for each line,
  * map keys are line numbers, 
  * values are arrays of specified attributes
  */ 
  public lineAttributes: Map<attributes>;

  /**
  * Create a Heap instance
  */ 
  constructor() {
    this.data = {};
    this.lineAttributes = {};
    this.error = undefined;
    this.errorCall = undefined; 
  }
  
  /**
  * Create an empty TreeNode instance, acts as a placeholder
  */ 
  public static emptyTree = new TreeNode(new Token("", "", -1, -1), -1);

  /**
  * Store attributes for a line
  *
  *   @param key - The line number
  *   @param values - An array of the specified attributes
  */ 
  public setAttributes(key:number, values:attribute[]) {
    this.lineAttributes[`${key}`] = { format:[], print: [] };
    for (let i = 0; i < values.length; i++) {
      if (values[i].type === 'format') 
        this.lineAttributes[`${key}`].format.push(values[i]);
      else if (values[i].type === 'print')
        this.lineAttributes[`${key}`].print.push(values[i]);
    }
  }

  /**
  * Get stored attributes at a line or row location
  *
  *   @returns The attributes at a given line 
  */ 
  public getAttributes(key:number): attributes|undefined {
    if (this.lineAttributes[`${key}`] === undefined)
      return;

    return this.lineAttributes[key];
  } 

  /**
  * Detect if the Heap instance has an error definition
  */ 
  public hasError() {
    return this.error !== undefined;
  }

  /**
  * Instantiate a placeholder for a HeapSlot 
  *
  *   @param key - The function definition's name
  */ 
  public initSlot(key: string) {
    if (!this.data[key]) { 
      this.data[key] = { 
        tree: undefined,
        profile: undefined
      }; 
    }
  }

  /**
  * Set a profile for a function definition
  *
  *   @param key - The function definition's name
  *   @param profile - The function's profile
  */ 
  public setProfile(
    key: string,
    profile: string,
  ) {
    this.initSlot(key);
    this.data[key].profile = profile;
  }

  /**
  * Set a root TreeNode instance for a function definition
  *
  *   @param key - The function definition's name 
  *   @param tree - The root TreeNode instance of the function definition
  */ 
  public setTree(
    key: string,
    tree: TreeNode,
  ) {
    this.initSlot(key);
    this.data[key].tree = tree;
  }

  /**
  * Set a HeapSlot value
  *
  *   @param key - The function definition's name
  *   @param tree - The function definition's root TreeNode instance
  *   @param profile - The function's profile
  */ 
  public setValue(
    key: string,
    tree: TreeNode,
    profile: string,
  ) {
    this.data[key] = {
      tree,
      profile,
    };
  }

  /**
  * Get a function definition's profile
  *
  *   @param key - The function definition's name
  *   @param e - The error data in case one is thrown
  */ 
  public getProfile(
    key: string,
    e: error = { line: 0, char: -1, text: "" },
  ): string {
    if (this.data[key] === undefined) {
      // Handle not defined
      ErrorHandler.functionNotDef(this, e);
    } else {
      return this.data[key].profile || "";
    }
    return "";
  }

  /**
  * Get a funciton definition's root TreeNode instance
  *
  *   @param key - The function definition's name
  *   @param e - The error data in case one is thrown
  */ 
  public getTree(
    key: string,
    e: error = { line: 0, char: -1, text: "" },
  ): TreeNode {
    if (this.data[key] === undefined) {
      // Handle not defined
      ErrorHandler.functionNotDef(this, e);
    } else {
      return this.data[key].tree || Heap.emptyTree;
    }
    return Heap.emptyTree;
  }
}
