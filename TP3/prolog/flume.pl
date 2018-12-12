:-ensure_loaded('server.pl').
:-use_module(library(lists)).
:-use_module(library(random)).
:-use_module(library(system)).
:-ensure_loaded('logic.pl').
:-ensure_loaded('board.pl').
:-ensure_loaded('input.pl').
:-ensure_loaded('menu.pl').

% Entry point
play :- main_menu.