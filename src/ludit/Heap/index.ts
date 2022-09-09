
import * as ErrorHandler from "../ErrorHandler";
import { error, errorCall, attribute, attributes, Map } from "../types";

import {Token} from "../Token";
import {TreeNode} from "../TreeNode";

interface HeapSlot {
    tree: TreeNode | undefined;
    profile: string | undefined;
}

/**
* The heap stores the function definition's root TreeNodes, for later use.
* it also stores error data and errorCallbacks for the nodejs API
*
* This class is used to create a Heap instance
*/
export class Heap {

  public static emptyTree = new TreeNode(new Token("", "", -1, -1), -1);

  public data: Map<HeapSlot>;
  public error: error | undefined;
  public errorCall: (errorCall|undefined);
  public lineAttributes: Map<attributes>;

  constructor() {
    this.data = {};
    this.lineAttributes = {};
    this.error = undefined;
    this.errorCall = undefined; 
  }
  
  public setAttributes(key:number, values:attribute[]) {
    this.lineAttributes[`${key}`] = { format:[], print: [] };
    for (let i = 0; i < values.length; i++) {
      if (values[i].type === 'format') 
        this.lineAttributes[`${key}`].format.push(values[i]);
      else if (values[i].type === 'print')
        this.lineAttributes[`${key}`].print.push(values[i]);
    }
  }

  public getAttributes(key:number): attributes|undefined {
    if (this.lineAttributes[`${key}`] === undefined)
      return;

    return this.lineAttributes[key];
  } 

  public hasError() {
    return this.error !== undefined;
  }

  public initSlot(key: string) {
    if (!this.data[key]) { this.data[key] = { tree: undefined, profile: undefined}; }
  }

  public setProfile(
    key: string,
    profile: string,
  ) {
    this.initSlot(key);
    this.data[key].profile = profile;
  }

  public setTree(
    key: string,
    tree: TreeNode,
  ) {
    this.initSlot(key);
    this.data[key].tree = tree;
  }

  public setValue(
    key: string,
    content: TreeNode,
    profile: string,
  ) {
    this.data[key] = {
      tree: content,
      profile,
    };
  }

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
