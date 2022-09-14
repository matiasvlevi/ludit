/*
* This code is a mess, I need to refactor this
*/ 

import * as Utils from '../ludit/Utils'

interface Map<T> {
  [key:string]:T
}

type objectTable<T> = (Map<T>)[];

// Default settings
const CHARS: Map<string> = {  
  'top': '─',
  'top-mid': '┬',
  'top-left': '┌',
  'top-right': '┐',
  'bottom': '─',
  'bottom-mid': '┴',
  'bottom-left': '└',
  'bottom-right': '┘',
  'left': '│',
  'mid-left': '├',
  'mid': '─',
  'mid-mid': '┼',
  'right': '│',
  'mid-right': '┤',
  'middle': '│',
  'tab': ' '
};

function sum (arr: number[]) {

  let sum = arr[0];
  for (let i = 1; i < arr.length; i++)
    sum += arr[i]

  return sum;
}

function printVerticalLine<T>(
  table:objectTable<T>,
  tabSize = 4,
  row = 0
) {

  let titles = Object.keys(table[0]);
  let length = titles.length;
  let len =  sum(
    titles.map(x => Math.max(3, x.length+2))
  ) + length+1;

  let j = 0;
  let k = 0;
  for (let i = 0; i < len; i++) {
    let char;
    let x = '';
    let y = '';


    if (i === 0) x = '-left';
    else if (i === len-1) x = '-right';
    else if (k === titles[j].length+3) {
      
      if (row <= 1) {
        x = ''
      }

      k = 0;
      j++;      


      if (j >= titles.length-1) {
        x = '-mid';
      }
    }

    if (row > 1 && row < table.length) y = 'mid';
    else if (row === 0 ) y = 'top';
    else if (row === table.length || row === 1) {
      if (i === 0 && row === 1) {
        y = 'mid'
        x = '-left'
      } else if (
        k === titles[j].length+3 &&
        j === titles.length-1 &&
        row === 1
      ) {
        y = 'mid'
        x = '-right'
      } else if (
        k === 0 &&
        j === titles.length-1 &&
        row === 1
      ) {
        y = 'mid';
        x ='-mid'
      } else {
        y = 'bottom'
      }
    }


    char = CHARS[`${y}${x}`]

    process.stdout.write(`\x1b[90m${char}\x1b[0m`);
    k++;
  }
  process.stdout.write('\n');
}

function hline(
  n:number,
  row = 0,
  rowLength: number,
  cellSize: number,
  cellStart: number,
) {
  let line = '';
  let k = -cellStart;
  for (let i = 0; i < n; i++) {
    let char:string;
    if (i === n-1) {
      // RIGHT SIDE
      //
      if (row >= 0 && row < rowLength-1) {
        char = 'mid-right'
      } else {
        char = 'bottom-right'
      }

    } else if (
      k >= cellSize &&
      row < rowLength-1
    ) {
      char = 'mid-mid'
      k = 0;
    } else if (k === 0) {
      // LEFT SIDE
      // 
      if (row === rowLength-1) 
        char = 'bottom-mid'
      else char = 'mid-mid' 
    } else {

      if (k >= cellSize) {
        char = 'bottom-mid'
        k = 0;    
      } else {
        if (i >= cellStart)
          char = 'bottom'
        else char = 'tab';
      }
    }
    line+=CHARS[char];
    k++;
  }
  return `\x1b[90m${line}\x1b[0m\n`
}

function space(n:number) {
  return new Array(n).fill(' ').join('');
}

function isOdd(n:number) {
  if (n === 0) return false;

  return (n % 2);
}

export function ktable<T>(table: objectTable<T>) {
  
  let rowProfile = Object.keys(table[0]);
  rowProfile.pop(); // Remove output 

  let colProfile = rowProfile.splice(0, Math.floor(rowProfile.length/2))
  let colCases = Utils.grayCode(
    colProfile.length,
  ).map(x => x.join(''));

  let rowCases = Utils.grayCode(
    rowProfile.length
  ).map(x => x.join(''));
  
  // Top labels
  process.stdout.write('\n')
  process.stdout.write(space(rowProfile.length+1));
  process.stdout.write(`\x1b[32m${colProfile.join('')}\x1b[0m`);
  process.stdout.write(space(1));

  for (let i = 0; i < Math.pow(2, colProfile.length); i++) {
    process.stdout.write(space(2));
    process.stdout.write(`\x1b[92m${colCases[i]}\x1b[0m`);
    process.stdout.write(space(3));
  }

  process.stdout.write('\n');
  process.stdout.write(`\x1b[32m${rowProfile.join('')}\x1b[0m`);
  process.stdout.write(`\n`);

  let colLength = Math.pow(2, colProfile.length);
  let rowLength = Math.pow(2, rowProfile.length);

  let cellSize = 5 + colProfile.length;
  let cellStart = rowProfile.length + colProfile.length + 1;


  let colCharLength = colLength * (colProfile.length + 5) +
    rowProfile.length +
    colProfile.length + 2;

  process.stdout.write(hline(
    colCharLength,
    0, rowLength,
    cellSize,
    cellStart
  ));
  let kIndex = 0;
  let rc = (rowLength * colLength)-2;

  let cc = [];
  for (let i = (rowLength*2)-1; i > 0; i-=2) {
    cc.push(i);
  }

  for (let row = 0; row < rowLength; row++) {
    process.stdout.write(' ')
    process.stdout.write(`\x1b[92m${rowCases[row]}\x1b[0m`);
    process.stdout.write(space(colProfile.length))
    process.stdout.write(`\x1b[90m${CHARS['right']}\x1b[0m`);

    for (let col = 0; col < colLength; col++) {

      process.stdout.write(space(2) + space(colProfile.length-1));

      process.stdout.write(`\x1b[33m${table[kIndex].out}\x1b[0m`);

      process.stdout.write(space(2));
      process.stdout.write(`\x1b[90m${CHARS['right']}\x1b[0m`);
      
      if (col === colLength-1) {
        kIndex-=rc;
      } else if (isOdd(col) ) {
        kIndex += cc[rowLength-row-1]
      } else {
        kIndex += cc[row];
      } 
    }
    rc-=2; 
    
    process.stdout.write('\n');
    process.stdout.write(hline(
      colCharLength,
      row, rowLength,
      cellSize,
      cellStart
    ));  
  }

}


export function table<T>(table: objectTable<T>) {
  let titles = Object.keys(table[0]);
  let titleRow:Map<any> = {};

  for (let i = 0; i < titles.length; i++) {
    titleRow[titles[i]] = titles[i];
  }

  table = [titleRow].concat(table)

  for (let row = 0; row < table.length; row++) {

    printVerticalLine<T>(table, 2, row);
    let color = row === 0 ? `\x1b[92m` : `\x1b[33m`  
    // Columns
    let colIndex = 0;
    for (let col in table[row]) {
  
      if (colIndex > 0 && colIndex < titles.length-1  )
        process.stdout.write(' ')
      else   
        process.stdout.write(`\x1b[90m${CHARS['middle']}\x1b[0m`)
      

      let cellLength = Math.max((col.length) - `${table[row][col]}`.length + 3, 3);

      for (
        let i = 0;
        i < cellLength;
        i++
      ) {
        if (i === Math.floor(cellLength/2)) process.stdout.write(
          `${color}${table[row][col]}\x1b[0m`
        )
        else process.stdout.write(' ');
      }
      colIndex++;
    }

    process.stdout.write(`\x1b[90m${CHARS['middle']}\x1b[0m`)

    process.stdout.write('\n');
  }

  printVerticalLine<T>(table, 2, table.length);
}
