import {Token} from "../Token";
import * as Tokenizer from "../Tokenizer";
import { Map } from "../types";

/**
* Represents a tree node in an operation tree
*
* Branches can hold either another tree node or a Token.
* A full Operation Tree can be referenced only by its root node
*/ 
export class TreeNode {

  /**
  * The root of the tree node,
  * This value is often an operator Token
  */ 
  public value: Token;

  /**
  * The left branch of this tree node
  */ 
  public left: TreeNode | Token | undefined;

  /**
  * The right branch of this tree node
  */
  public right: TreeNode | Token | undefined;

  /**
  * The type of this tree node, this property is 
  * present for the purpose of making a TreeNode instance 
  * usable as a single Token which can then act as a value once computed
  */ 
  public type: string;

  /**
  * The priotity of the tree node, this property is 
  * present for the purpose of making a TreeNode instance 
  * usable as a single Token which can then act as a value once computed 
  */ 
  public priority: number;

  /**
  * The result of a tree computation
  */ 
  public result: boolean | undefined;

  /**
  * The column number of the expression, for error messages 
  */ 
  public char: number;

  /**
  * create a TreeNode
  * 
  *   @param value - The root token of this TreeNode
  *   @param char - The column number of this TreeNode for error messages
  *   @param left - The left branch of this TreeNode
  *   @param right - The right branch of this TreeNode
  */ 
  constructor(
    value: Token,
    char: number,
    left?: TreeNode | Token | undefined,
    right?: TreeNode | Token | undefined,
  ) {
    this.type = "variable";
    this.priority = -1;
    this.value = value;
    this.left = left;
    this.right = right;
    this.result = undefined;
    this.char = char;
  }

  /**
  * create a copy of the TreeNode
  *
  *   @returns an identical copy of the TreeNode
  */
  public copy(): TreeNode {
    return new TreeNode(
      this.value,
      this.char,
      this.left?.copy(),
      this.right?.copy(),
    );
  }

  /**
  * Detect wheter or not the TreeNode has already been computed
  *
  *   @returns wheter or not the TreeNode was computed
  */
  public isCalculated(): boolean {
    return this.result !== undefined;
  }

  /**
  * calculate the TreeNode values
  *
  *   @param input - an array of input bits
  *   @param profile - the expression's profile
  *
  */
  public calculate(input: boolean[], profile: string): boolean {
    if (this.left instanceof TreeNode) {
      if (!(this.left?.isCalculated())) {
        this.left?.calculate(input, profile);
      }
    }

    if (this.right instanceof TreeNode) {
      if (!(this.right?.isCalculated())) {
        this.right?.calculate(input, profile);
      }
    }

    if (
      (this.left instanceof Token || this.left?.isCalculated()) &&
            (this.right instanceof Token || this.right?.isCalculated())
    ) {
      this.result =
                Tokenizer.OPERATORS[this.value.literal].op( // TODO: Clean this shit up
                  (this.left instanceof Token) ?
                    ((this.left.type !== "constant") ?
                      input[profile.indexOf(this.left?.literal)] :
                      !!+this.left.literal) :
                    this.left?.result || false,

                  (this.right instanceof Token) ?
                    ((this.right.type !== "constant") ?
                      input[profile.indexOf(this.right?.literal)] :
                      !!+this.right.literal) :
                    this.right?.result || false,
                );
    }
    return this.result || false;
  }

  /**
  * sets the arguments of a function into the scope
  *
  *   @param args - The tokens stored in an object
  *   @param profile - The profile of the function
  */
  public setScope(args: Map<Token|TreeNode>, profile: string) {

    // If is TreeNode, recurse
    if (this.left instanceof TreeNode) { this.left?.setScope(args, profile); } else {
      // Replace left side with given argument token
      this.left = args[this.left?.literal || "."];
    }

    // If is TreeNode, recurse
    if (this.right instanceof TreeNode) { this.right?.setScope(args, profile); } else {
      // Replace right side with given argument token
      this.right = args[this.right?.literal || "."];
    }
  }
}
