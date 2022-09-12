import { Map } from "../../ludit/types";
import {CLI} from "../index";

export type optionAction = (cli: CLI, param: string) => void;

export interface optionConfig {
    action: optionAction;
    requireParam: boolean;
    helpmsg?: string;
    example?: string;
    errormsg?: string;
}

export const queries: Map<optionConfig> = {
  help: {
    action: (cli: CLI, param: string) => {
      for (const key in queries) {

        console.log(`\n  \x1b[36m--${key}, -${key[0]}\x1b[0m`);
        if (queries[key].helpmsg !== undefined) {
          console.log(`\t${queries[key].helpmsg}`);
        }

        if (queries[key].example !== undefined) {
          console.log(`\t\x1b[90mex: ludit ${queries[key].example}\x1b[0m`);
        }

        console.log("");
      }
    },
    helpmsg: "show this help menu",
    requireParam: false,
  },
  csv: {
    action: (cli: CLI, param: string) => {
      if (cli.options.file === undefined)
        cli.save(param);
    },
    helpmsg: "save the truth table as a .csv file",
    example: '"A * B + C" --csv sheet.csv',
    requireParam: false,
  },
  select: {
    action: (cli: CLI, param: string) => {
      cli.runSingle(param);
    },
    helpmsg: "select a specific set of inputs to calculate",
    example: '"A * B + C" --select 101',
    requireParam: true,
  },
  file: {
    action: (cli: CLI, param: string) => {
      if (cli.options.csv !== undefined) {
        cli.saveMultiline(param);
      } else {
        cli.fromFile(param);
      }
    },
    helpmsg: "read expression from a source file",
    example: "--file formula.ludi",
    requireParam: true,
  },
};
