import { Map } from "../../ludit/types";
import { optionAction, optionConfig, queries } from "./queries";

export interface option {
    action: optionAction;
    param?: string;
    requireParam: boolean;
    type: string;
}

export interface argv {
    argument: string;
    queries: Map<option>;
}

export class Options {
  public static queries: Map<optionConfig> = queries;

  public static isOption(text: string) {
    return (Options.queries[text] !== undefined);
  }

  public static getOptionFromAbreviation(char: string): string | undefined {
    for (const key in Options.queries) {
      if (char === key[0]) { return key; }
    }
    return;
  }

  public static noParam(argv: string[], i: number) {
    return (argv[i + 1] !== undefined && argv[i + 1][0] !== "-");
  }

  public static parse(argv: string[]) {
    const data: argv = {
      argument: "",
      queries: {},
    };
    for (let i = 0; i < argv.length; i++) {
      if (argv[i][0] === "-") {
        if (argv[i][1] === "-") {
          const opt = argv[i].slice(2, argv[i].length);
          if (Options.isOption(opt)) {
            data.queries[opt] = {
              action: Options.queries[opt].action,
              param: Options.noParam(argv, i) ? argv[i + 1] : undefined,
              type: "option",
              requireParam: Options.queries[opt].requireParam,
            };
            if (Options.noParam(argv, i)) { argv.splice(i + 1, 1); }
          }
        } else {
          const opt =
                        Options.getOptionFromAbreviation(argv[i][1]);
          if (opt !== undefined) {
            data.queries[opt] = {
              action: Options.queries[opt].action,
              param: Options.noParam(argv, i) ? argv[i + 1] : undefined,
              type: "option",
              requireParam: Options.queries[opt].requireParam,
            };
            if (Options.noParam(argv, i)) { argv.splice(i + 1, 1); }
          }
        }
      } else if (i >= 2) {
        data.argument = argv[i];
      }
    }
    return data;
  }
}
