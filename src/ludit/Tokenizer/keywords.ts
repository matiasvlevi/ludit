import { Map, syntax, operation } from "../types";

/*
* Keyword or Character maps for tokens
*/
export const KEYWORD: Map<syntax> = {
  def: {
    type: "function",
    priority: -1,
  }
};

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