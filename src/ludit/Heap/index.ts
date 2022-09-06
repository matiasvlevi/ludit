import { ErrorHandler } from "../ErrorHandler";
import { error, errorCall, Map } from "../types";

import Token from "../Token";
import TreeNode from "../TreeNode";

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
export default class Heap {

  public static emptyTree = new TreeNode(new Token("", "", -1, -1), -1);

  public data: Map<HeapSlot>;
  public error: error | undefined;
  public errorCall: (errorCall|undefined);

  constructor() {
    this.data = {};
    this.error = undefined;
    this.errorCall = undefined;
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
