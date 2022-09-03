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
syn match String "\".*\""

syn match Number "0"
syn match Number "1"

syn match Function "\l"
syn match Repeat "\<include\>"
syn match Repeat "\<def\>"
syn match Function /\w\+\s*=/me=e-1,he=e-1 

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
