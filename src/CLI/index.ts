import * as Tabler from './table'
import * as Utils from "../ludit/Utils";

import { argv, option } from "./options";
import { queries as QUERIES } from "./options/queries";

import {Token} from "../ludit/Token";
import {TreeNode} from "../ludit/TreeNode";
import { 
  luditLineReturn,
  attributeConfig,
  attribute,
  Iterator,
  Map
} from "../ludit/types";

import * as Preparser from "../ludit/Preparser"

import {
  Assembler,
  Heap,
  Processor,
  Tokenizer,
} from "../ludit/Core";

export class CLI {

  public profile: string;
  public tree: TreeNode;
  public options: Map<option>;
  public expression: string;
  public heap: Heap;
  public path: string | undefined;
  public noprint: boolean;
  public attributes: attributeConfig;

  constructor(options: argv, noRun = false) {
    this.noprint = false;
    this.heap = new Heap();
    this.tree = new TreeNode(
      new Token("", "", -1, -1),
      -1,
      new Token("", "", -1, -1),
      new Token("", "", -1, -1),
    );

    this.attributes = {...CLI.DEFAULT_ATTRIBUTE_CONFIG}
    
    this.profile = "";
    this.expression = options.argument;
    this.options = options.queries;

    // Run inline if no file was specified
    if (noRun) { return; }
    if (!this.options.file) {
      // Show help if no options specified
      if (this.expression.length <= 0) {
        this.options.help = {
          requireParam: false,
          action: QUERIES.help.action,
          type: "option", param: "",
        };
        this.main();
        return;
      }

      this.inline();

    } else { this.main(); }
  }

  public static DEFAULT_ATTRIBUTE_CONFIG:attributeConfig = {
    reverse: false,
    karnaugh: false,
    table: true,
    cases: -1
  }

  public initAttributes() {
    this.attributes = {...CLI.DEFAULT_ATTRIBUTE_CONFIG};
  }

  public inline() {
    const err = {
      line: 0,
      char: 0,
      text: this.expression,
    };
    const { tokens, profile } = Tokenizer.process(
      this.heap,
      this.expression || "A", err,
    );

    this.profile = profile;

    this.tree = Assembler.makeTree(
      this.heap, tokens,
      profile, err,
    );

    this.main();
  }

  public fromFile(filename: string) {
    // Load file
    let file = Preparser.loadFile(filename);
    const fileLineNb = file.length;
    let includeLineNb = 0;

    this.path = Preparser.getPath(filename);

    // Remove file option so it does not run recursively
    delete this.options.file;

    // Handle included files
    if (Preparser.containsInclude(file)) {
      file = Preparser.include(file, this.path);
      includeLineNb = file.length - fileLineNb;
    }

    for (let i = 0; i < file.length; i++) {
      const currentLine = i + 1 - includeLineNb;
      // Parse commments & prints
      const line = Preparser.filter(file[i]);
      if (!line) { continue; } // Skip if empty line

      // Create tokens, profile and determine if line is a definition
      const { tokens, profile, isDef } = Tokenizer.process(
        this.heap,
        line,
        { line: currentLine, char: -1, text: file[i]}, i
      );

      this.profile = profile; // Save profile (Variables used in line or definition)
      this.expression = line; // Save raw line

      // Create computation tree
      this.tree = Assembler.makeTree(this.heap, tokens, profile, {
        line: currentLine,
        char: -1,
        text: file[i],
      });

      // Dont compute and print if is a definition
      if (!isDef) { this.main(i); }
    }

  }

  public setNoPrint(state: boolean) {
    this.noprint = state;
  }

  // Calculate a single case
  public runSingle(_input: string) {
    const input = _input.split("").map((x) => +x);
    const output = +Processor.calculate(this.tree, this.profile, input); 

    if (!this.noprint) { 
      console.log(`${CLI.applyValues(
        this.expression,
        _input,
        this.profile,
      )} = \x1b[33m${output}\x1b[0m`);
    }
  }

  public printSingle() {
    if (!this.noprint) { 
      console.log(
        `${this.expression} = ` +
            `\x1b[33m${+Processor.calculate(this.tree, this.profile, [])}\x1b[0m`,
      );
    }
  }

  public ktable(table: luditLineReturn) {
    Tabler.ktable<number>(table);
  }

  public table(table: luditLineReturn) {
    Tabler.table<number>(table);
  }

  // Calculate a truth table
  public run(currentLine = 0, isKarnaugh=false): luditLineReturn {
    // Run specific function call
    if (this.profile.length === 0) {
      this.printSingle();
      return [];
    }

    this.initAttributes();

    let attributes: attribute[]|undefined = this.heap.getAttributes(currentLine);
    if (attributes !== undefined) {
      for (let i = 0; i < attributes.length; i++) {
        attributes[i].action(this, attributes[i].char);
      } 
    }

    let cases:number[][] = []; 
    if (!isKarnaugh) cases = Utils.binaryCases(
      this.profile.length,
      this.attributes.reverse,
      this.attributes.cases
    );
    else if (isKarnaugh) {
      cases = Utils.grayCode(
        this.profile.length
      );
    }

    const output: Array<Map<number>> = [];

    // Iterate forward or backwards
    let profileIterator:Iterator = { 
      start: 0,
      condition: (j)=>(j<this.profile.length),
      increment: 1
    }
    if (this.attributes.reverse) 
      profileIterator = { 
        start: this.profile.length-1,
        condition: (j) => (j>=0),
        increment: -1
      }

    for (let i = 0; i < cases.length; i++) {


      const row: Map<number> = {};
      for (
        let j = profileIterator.start;
        profileIterator.condition(j);
        j+=profileIterator.increment
      ) {
      
        row[this.profile[j]] = cases[i][j];

      }

      
      row.out = +Processor.calculate(
        this.tree,
        this.profile,
        cases[i]
      );

      output.push(row);
    }


    if (!this.noprint) { 
    
      if (!isKarnaugh)
        this.table(output)
      else if (isKarnaugh)
        this.ktable(output)
    }

    return output;
  }

  public save(filename: string) {
    const cases = Utils.binaryCases(this.profile.length);
    let csv = `${this.profile.split("").join(",")},out\n`;
    for (let i = 0; i < cases.length; i++) {
      for (let j = 0; j < this.profile.length; j++) {
        csv += `${cases[i][j]},`;
      }
      csv += +Processor.calculate(this.tree, this.profile, cases[i]);
      csv += "\n";
    }
    if (!this.noprint) { process.stdout.write(csv); }
    if (filename !== undefined) {
      Utils.writeFileSync(filename, csv, "utf-8");
    }
  }

  public main(currentLine = 0): luditLineReturn { 
    if (Object.keys(this.options).length === 0) { 
      let output:luditLineReturn = []; 
      if (this.attributes.table)
        output = this.run(currentLine, false)

      if (this.attributes.karnaugh) {
        if (this.attributes.table) {
          this.run(currentLine, true)
        } else {
          output = this.run(currentLine, true)
        }
      }
      
      return output;
    }
    for (const query in this.options) {
      if (
        this.options[query].requireParam &&
        this.options[query].param === undefined
      ) { continue; }
      if (
        this.options[query].param !== undefined
      ) {
        this.options[query].action(
          this,
          this.options[query].param || "",
        );
      }
    }
    return [];
  }

  public static applyValues(expression: string, values: string, profile: string) {
    for (let i = 0; i < profile.length; i++) {
      expression = Utils.replaceAll(expression, profile[i], values[i]);
    }
    return expression;
  }
}
