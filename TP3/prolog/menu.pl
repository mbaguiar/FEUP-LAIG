% Main menu actions
action(1):- sub_menu_board_size(Size), start_game(Size, 0, 0).
action(2):- sub_menu_board_size(Size), sub_menu_ai_difficulty(0, Difficulty), sub_menu_first_player(First), 
			get_player_types(0, Difficulty, First, P1, P2), start_game(Size, P1, P2).
action(3):- sub_menu_board_size(Size), sub_menu_ai_difficulty(1, Difficulty1), sub_menu_ai_difficulty(2, Difficulty2), 
			sub_menu_first_player(First), get_player_types(Difficulty1, Difficulty2, First, P1, P2), 
			start_game(Size, P1, P2).
action(4):- true.

% Prints main menu
print_menu:-
	write('Welcome to FLUME:\n\n'),
	write('1. Human vs Human\n'),
	write('2. (1)Human vs (2)AI\n'),
	write('3. (1)AI vs (2)AI\n'),
	write('4. Exit\n').

% Prints menu and waits for input
main_menu:-
	print_menu,
	read_menu_input(Input),
	(check_input_bounds(Input, 1, 4), action(Input));
	(write('Invalid input. Try again.\n\n'),
	main_menu).

%Submenus

% Board size submenu
sub_menu_board_size(Size):-
	read_board_size_input(Size),
	(check_board_size(Size), true);
	sub_menu_board_size(Size).

% AI difficulty submenu
sub_menu_ai_difficulty(AI, Difficulty):-
	read_ai_difficulty_input(AI, Difficulty),
	(check_input_bounds(Difficulty, 1, 2), true);
	(write('Invalid input.\n'), sub_menu_ai_difficulty(AI, Difficulty)).

% First player submenu
sub_menu_first_player(First):-
	read_first_player_input(First),
	check_input_bounds(First, 1, 2).

sub_menu_first_player(First):-
	write('Invalid input.\n'), sub_menu_first_player(First).

% Input checks

% Check input bounds
check_input_bounds(Input, Min, Max):-
	Input >= Min,
	Input =< Max.

% Check board size
check_board_size(Size):-
	(check_input_bounds(Size, 5, 25);
	(write('Invalid input\n'), !, fail)),
	Size mod 2 =\= 0.

check_board_size(_):-
	write('Board size must be odd.\n'),
	fail.

get_player_types(P1Type, P2Type, First, P1, P2):-
	First =:= 1,
	P1 = P1Type,
	P2 = P2Type.

get_player_types(P1Type, P2Type, _, P1, P2):-
	P1 = P2Type,
	P2= P1Type.