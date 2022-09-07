import { CLI } from '../../CLI'
import { Map, syntax, operation, attribute } from "../types";

/*
* Keyword or Character maps for tokens
*/
export const KEYWORD: Map<syntax> = {
  def: {
    type: "function",
    priority: -1,
  } 
};

export const ATTRIBUTE_DECLARATION: Map<syntax> = {
  "~": {
    type: 'attributeKey',
    priority: -1
  }
}

export const ATTRIBUTES: Map<attribute> = {
  "r": {
    char: 'r',
    action: (app: CLI, char:string) => {
      app.attributes.reverse = true;
    }
  },
  "k": {
    char: 'r',
    action: (app: CLI, char:string) => {
      app.attributes.karnaugh = true;
    }
  },
  "t": {
    char: 'r',
    action: (app: CLI, char:string) => {
      app.attributes.table = true;
    }
  },
  "numeric": {
    char: '0',
    action: (app: CLI, char:string) => {
      app.attributes.cases = +char;
    }
  }
}

export const CONSTANT: Map<syntax> = {
  "0": {
    type: "constant",
    priority: -1,
  },
  "1": {
    type: "constant",
    priority: -1,
  }
};

export const FUNCTION: Map<syntax> = {
  "=": {
    type: "operator",
    priority: 0.5,
  }
};

export const SYNTAX: Map<syntax> = {
  "(": {
    type: "open",
    priority: 0,
  },
  ")": {
    type: "close",
    priority: 0,
  }
};

export const OPERATORS: Map<operation> = {
  "+": {
    type: "operator",
    priority: 1,
    op: (a: boolean, b: boolean) => (a || b),
  },
  "*": {
    type: "operator",
    priority: 2,
    op: (a: boolean, b: boolean) => (a && b),
  },
  "!": {
    type: "operator",
    priority: 3,
    op: (a: boolean, b: boolean) => (!b),
  },
  "'": {
    type: "operator",
    priority: 3,
    op: (a: boolean, b: boolean) => (!b),
  }
};
