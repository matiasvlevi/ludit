" Vim syntax file
" Language: Ludit File
" Maintainer: Matias Vazquez-Levi
" Latest Revision: 1st september 2022

let b:current_syntax = "ludi"
syn region ludiDescBlock start="(" end=")" fold transparent

syn match Identifier "*"
syn match Float "+"
syn match Repeat "!"
syn match Repeat "'"
syn match String "-.*$"

syn keyword ludiTodo contained AND OR XOR XNOR NOR NAND NOT BUFFER
syn match ludiComment "#.*$" contains=ludiTodo
highlight link ludiTodo Repeat

highligh link ludiComment    Comment
highligh link ludiNumber     Number
highlight link ludiBlockCmd   Statement

au BufRead,BufNewFile *.ludi set filetype=ludi

if exists("b:current_syntax")
  finish
endif
