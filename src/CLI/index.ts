// TODO: Doc comments

import * as Tabler from './table'
import * as Utils from "../ludit/Utils";

import { argv, option } from "./options";
import { queries as QUERIES } from "./options/queries";

import {Token} from "../ludit/Token";
import {TreeNode} from "../ludit/TreeNode";
import { 
  luditLineReturn,
  attributeConfig,
  attributes,
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

/**
* The Command Line frontend, 
* uses other ludit modules to parse & compute expressions
*/ 
export class CLI {

  /**
  * The current line's profile 
  */
  public profile: string;

  /**
  * The global profile if specified,
  * Will force every expression to adopt this profile
  */ 
  public globalProfile: string | undefined;

  /**
  * The root TreeNode of the current Line
  */ 
  public tree: TreeNode;

  /**
  * The parsed cli options
  */ 
  public options: Map<option>;

  /**
  * The current line's raw expression
  */ 
  public expression: string;

  /**
  * The program's Heap instance
  */ 
  public heap: Heap;

  /**
  * The path of the running file
  */ 
  public path: string | undefined;

  /**
  * Whether to print the tables or not
  */ 
  public noprint: boolean;

  /**
  * The current line's attribute config 
  */ 
  public attributes: attributeConfig;

  /**
  * Total lines of included files
  */
  public includeLineNb: number;

  constructor(options: argv, noRun = false) {
    this.noprint = false;
    this.heap = new Heap();
    this.tree = new TreeNode(
      new Token("", "", -1, -1),
      -1,
      new Token("", "", -1, -1),
      new Token("", "", -1, -1),
    );

    this.includeLineNb = 0;
    this.attributes = {...CLI.DEFAULT_ATTRIBUTE_CONFIG}
    this.globalProfile = undefined; 
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

      // Run inline if cli expression specified
      this.inline();

    } else { 
      // Run 
      this.main();
    }
  }

  public static DEFAULT_ATTRIBUTE_CONFIG:attributeConfig = {
    reverse: false,
    karnaugh: false,
    table: true,
    cases: -1
  }

  public static FALSE_ATTRIBUTE_CONFIG:attributeConfig = {
    reverse: false,
    karnaugh: false,
    table: false,
    cases: -1
  }

  public initAttributes() {
    this.attributes = {...CLI.DEFAULT_ATTRIBUTE_CONFIG};
  }

  public resetAttributes() {
    this.attributes = {...CLI.FALSE_ATTRIBUTE_CONFIG};
  }

  public addPrintAttribute() {
    if (
      !this.attributes.karnaugh &&
      !this.attributes.table
    ) this.attributes.table = true;
  }

  public hasPrintAttribute(attributes:attributes|undefined) {
    if (attributes === undefined) return false;
    if (attributes.print.length === 0) return false;  
    return true;
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

  public filterFile(line:string) {
    const preparseOutput = Preparser.filter(line, !this.noprint);
    
    if (preparseOutput.line.length === 0) return {
      skip: true,
      line: ''
    } 

    if (preparseOutput.type === 'comment')  
      return { skip: false, line: preparseOutput.line }; 
    
    if (preparseOutput.type === 'print') {
      if (this.options.csv)
        return { skip: true, line: preparseOutput.line }; // CONTINUE IN THE PARENT LOOP
      else
        return { skip: true, line: '' }; // CONTINUE IN THE PARENT LOOP
    }

    return {skip: false, line: preparseOutput.line};

  }

  public setGlobalProfile(profile:string) {
    this.globalProfile = profile;
  }

  public setLineNb(totalLines:number, rawFileLength:number) {
    this.includeLineNb = totalLines - rawFileLength;
  }

  // DUPLICATE CODE WITH CLI.prototype.fromFile, REFACTOR!
  public process(filename: string) {
    // Load file
    let file = Preparser.loadFile(filename);
    let includeLineNb = 0;

    this.path = Preparser.getPath(filename);

    // Remove file option so it does not run recursively
    delete this.options.file;
    if (this.options.csv) this.noprint = true;


    file = Preparser.handleKeywords(file, this);

    let csv:string[] = [];
  
    for (let i = 0; i < file.length; i++) {
      const currentLine = i + 1 - includeLineNb;

      // Remove comments and prints
      const { line, skip } = this.filterFile(file[i]);

      // Line is empty, skip iteration
      if (skip) {
        csv.push(line);
        continue;
      }

      // Process ludit code, and determine whether or not line is a definition
      const isDef = this.processLudit(      
        file[i],
        line,
        currentLine,
        i
      );

      // Print if no definition & dont print csv exports
      if (this.options.csv) this.noprint = true;
      else this.noprint = isDef
      
      if (this.options.csv) {
        let output = this.getCsvRow(isDef, i);
        if (output.length > 0) csv.push(output);
      } else {
        this.main(i);
      }
    }

    // Write all tables
    if (this.options.csv) {
      Utils.writeFileSync(
        this.options.csv.param || 'table.csv',
        csv.join('\n'),
        'utf-8'
      );
      delete this.options.csv;
    }
  }

  public getCsvRow(isDef: boolean, currentLine: number) {
    this.resetAttributes();
    this.loadAttributes(currentLine);
    
    // Dont compute and print if is a definition
    if (!isDef) {
      return this.save();
    } else {
      return '';
    }
  }

  public processLudit(fileLine:string, preparsedLine:string, currentLine: number, rawLineNb:number): boolean {
    // Create tokens, profile and determine if line is a definition
    const { tokens, profile, isDef } = Tokenizer.process(
      this.heap,
      preparsedLine,
      { line: currentLine, char: -1, text: fileLine},  
      rawLineNb
    );

    this.profile = profile; // Save profile (Variables used in line or definition)
    this.expression = preparsedLine; // Save raw line

    // Create computation tree
    this.tree = Assembler.makeTree(this.heap, tokens, profile, {
      line: currentLine,
      char: -1,
      text: fileLine,
    });

    return isDef;
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
    Tabler.ktable<number>(table, this.attributes.reverse);
  }

  public table(table: luditLineReturn) {
    Tabler.table<number>(table);
  }

  public loadAttributes(currentLine:number) {
    let attributes: attributes|undefined = this.heap.getAttributes(currentLine);
    if (attributes !== undefined) {

      for (let i = 0; i < attributes.format.length; i++) {
        attributes.format[i].action(
          this,
          currentLine,
          attributes.format[i].char
        );
      } 

      for (let i = 0; i < attributes.print.length; i++) {
        attributes.print[i].action(
          this,
          currentLine,
          attributes.print[i].char
        );
      } 
      this.addPrintAttribute();
    } else {
      this.initAttributes();
    }
    return attributes;
  }

  // Calculate a truth table
  public run(isKarnaugh=false): luditLineReturn {
    // Run specific function call
    if (this.profile.length === 0) {
      this.printSingle();
      return [];
    }

    let profile = (this.globalProfile) ? this.globalProfile : this.profile;

    let cases:number[][] = []; 
    if (!isKarnaugh) cases = Utils.binaryCases(
      profile.length,
      this.attributes.reverse,
      this.attributes.cases
    );
    else if (isKarnaugh) {
      cases = Utils.grayCode(
        profile.length
      );
    }

    const output: Array<Map<number>> = [];

    let profileIterator = this.getProfileIterator(profile.length);

    for (let i = 0; i < cases.length; i++) {


      const row: Map<number> = {};
      for (
        let j = profileIterator.start;
        profileIterator.condition(j);
        j+=profileIterator.increment
      ) {
        row[profile[j]] = cases[i][j];
      }

      
      row.out = +Processor.calculate(
        this.tree,
        profile,
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

  public getProfileIterator(profileLength: number): Iterator {
    // Iterate forward or backwards
    if (this.attributes.reverse) {
      return { 
        start: profileLength-1,
        condition: (j) => (j>=0),
        increment: -1
      }
    } else {
      return { 
        start: 0,
        condition: (j)=>(j<profileLength),
        increment: 1
      }
    } 
  }

  public save(filename?: string | undefined): string {
    
    let profile = this.globalProfile || this.profile;

    const cases = Utils.binaryCases(
      profile.length,
      this.attributes.reverse,
      this.attributes.cases
    );
    
    let profileIterator = this.getProfileIterator(profile.length);

    let csv = ',';
    if (this.attributes.reverse) 
      csv += `${profile.split("").reverse().join(",")},out\n,`;
    else 
      csv += `${profile.split("").join(",")},out\n,`
    
    for (let i = 0; i < cases.length; i++) {
      for (
        let j = profileIterator.start;
        profileIterator.condition(j);
        j+=profileIterator.increment
      ) {
        csv += `${cases[i][j]},`;
      }

      csv += +Processor.calculate(this.tree, profile, cases[i]);
      csv += "\n,";
    }
    if (!this.noprint) { process.stdout.write(csv); }
    if (filename !== undefined) {
      Utils.writeFileSync(filename, csv, "utf-8");
      
    } 
    return csv
  }

  public main(currentLine = 0): luditLineReturn {

    this.resetAttributes();
    let attributes = this.loadAttributes(currentLine);

    if (Object.keys(this.options).length === 0) { 
      let output:luditLineReturn = []; 

      if (!this.hasPrintAttribute(attributes))
        this.run(false);
      
      return output;
    }

    // Run options
    for (const query in this.options) {
      if (
        this.options[query].requireParam &&
        this.options[query].param === undefined
      ) continue;

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
