import Tokenizer from './index'

import Utils from '../Utils'

import { ErrorHandler, error } from '../ErrorHandler'

import Heap from '../Heap'
import Parser from '../Parser'
import TreeNode from '../TreeNode'
import Token from '../Token'

/**
* datatype returned by handleCall
*
*   @param defaultParams - wheter or not the function uses its default parameters
*   @param newLocation - The location after the function call
*   @param argProfile - The profile of the function in the argument field
*
*/
type handleCallReturn = {
	defaultParams: boolean,
	newLocation: number,
	argProfile: string[]
}

/**
*	Tokenizes function calls and their arguments
*
*   @param heap - Object containing defined function data
*	  @param tokens - List of current tokens
*	  @param exp - the expression as an array
*	  @param word - the called function's name
*	  @param i - the current location in the expression
*	  @param e - The error data in case on gets thrown
*
*   @returns data about the function call 
*/
export function handleCall(
    heap: Heap,
    tokens: (Token|TreeNode)[],
    exp: string[],
    word: string,
    profile: string[],
    i: number,
    e: error
): handleCallReturn {
    let start = i+word.length+1;
    let j = start;

    e.char = j;
    let expectedArgs = heap.getProfile(word, e) || '';

    // If opening bracket exists, add a token
    if (exp[j-1] === '(') {	
        tokens.push(new Token(
            exp[j-1],
            'argOpen',
            -1, j-1
        ));
    } else {
        // Look ahead for a closing bracket to ensure 
        // it is a function called with default params
        
        // Could and should be turned into Tokenizer.lookAhead
        let k = j;
        while (
            k < exp.length &&
            !Tokenizer.isOperator(exp[k]) &&
            exp[k] !== ')'
        ) {
            k++;

            // If encounters a closing bracket,
            // and no opening was provided, throw an error
            if (exp[k] === ')') {
                e.char = j;
                ErrorHandler.expectedOpening(heap, e);
            }
        }

        // No args specified, function called with defaults
        return { 
            defaultParams: true,
            newLocation:0,
            argProfile:[]
        }
    }
    // Iterate through every expected argument field
    for (let a = 0; a < expectedArgs.length; a++) {
        // Find where argument field closes
        while(
            j < exp.length &&
            (exp[j] !== ',' &&
            exp[j] !== ')')
        ) {
            j++;
            // Skip function call if exists
            j = Tokenizer.skipFieldCall(exp, j);

        }

        // Get argument field expression
        let argExpression = exp.join('').slice(start, j)

        // If is constant, push a single Token
        if (Tokenizer.isConstant(
            Utils.removeWhiteSpace(argExpression)
        )) {
            tokens.push(new Token(
                argExpression,
                'constant',
                -1, i
            ));
            
            // Increment j and start at j
            j++;
            start = j;

            continue;
        }

        // Create tokens for the argument field	
        let arg = Tokenizer.process(heap, argExpression, e, start);
    
        if (arg.tokens.length === 0) {
            ErrorHandler.badArgumentSpecification(
                a, expectedArgs.length, heap, e
            );
        }
        e.char = j-1;

        // Add argument field's profile to the line's profile
        profile = Utils.removeDuplicates(
            profile.concat(arg.profile.split('')).join('')
        ).split('');

        // Create a tree with the new tokens
        let argTree = Parser.makeTree(heap, arg.tokens, arg.profile, e);

        // Make the tree an argument type 
        argTree.type = 'argument';
        argTree.char = j-1;

        // Add the tree to the line's tokens
        tokens.push(argTree);

        // Increment j, and start at j for next argument
        j++;
        start = j;
    }

    // Find other surplus arguments
    let k = j-1;
    while(exp[k] !== ')') {
        // Too many args
        if (Tokenizer.isVariable(exp[k])) {
            e.char = k;
            ErrorHandler.badArgumentSpecification(
                expectedArgs.length+1, expectedArgs.length, heap, e
            );
        }
        // No closing bracket
        if (k >= exp.length) {
            e.char = k-1;
            ErrorHandler.expectedClosing(heap, e);
        }
        k++;
    }

    j--;
    // Is a closing bracket present?
    // if not the Parser will catch the error if there is not
    if (exp[j] === ')') {	
        tokens.push(new Token(
            exp[j],
            'argClose',
            -1, j
        ));
    } 

    return { 
        defaultParams:false,// Is the function called with default params?
        newLocation: j,		// The new location in the expression
        argProfile: profile // The new profile
    };
}
