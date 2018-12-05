% Print board and player turn
display_game(Board, Player):-
	nl, print_board(Board), nl,
	print_player_turn(Player).

% Print player's turn
print_player_turn(0):-
	write('The game ended.').

print_player_turn(1):-
	write('Red player\'s turn: ').

print_player_turn(2):-
	write('Blue player\'s turn: ').

% Prints board
print_board(Board):- 
	length(Board, N), 
	print_coordinates(N), 
	print_board(Board, N , 0),
	print_separation(N), nl.

% Prints board with size 
print_board([], _, _).
print_board([L | B], N, I):- 
	print_separation(N), nl, 
	I1 is I+1,
	(I1 < 10 -> write(' '); true),
	write(I1),  % prints side coordinate number
	print_line(L), % prints current line
	write(' |'), nl, 
	print_board(B, N, I1). % recursive call without the printed line

% Prints N top coordinates
print_coordinates(N):- 
	write('   '), 
	print_coordinates(N, 0), 
	write('|'), nl.

print_coordinates(N, N).
print_coordinates(N, I):-
	I1 is I +1,
	write('| '),
	write(I1), % prints coordinate number
	(I1 < 10 -> write(' '); true),
	print_coordinates(N, I1).

% Prints separation between lines with size N
print_separation(N):-
	print_separation(N, -1).

print_separation(N, N).
print_separation(N, I):-
	I1 is I+1,
	write('---|'),
	print_separation(N, I1).

% Prints a board line
print_line([]).
print_line([C | L]):-
	write(' | '), 
	print_cell(C), % prints element of line
	print_line(L). % recursive call without the printed element

% Prints a board cell
print_cell(0):- write(' ').
print_cell(1):- write('R').
print_cell(2):- write('B').
print_cell(3):- write('G').

% Prints game winner
print_winner(1, P1Pieces, P2Pieces):- 
	nl, write('Player Red won!\n'), 
	write('Score: '), write(P1Pieces), 
	write(' to '), write(P2Pieces), nl.

print_winner(2, P1Pieces, P2Pieces):- 
	nl, write('Player Blue won!\n'),
 	write('Score: '), write(P2Pieces), 
	 write(' to '), write(P1Pieces), nl.

	 
