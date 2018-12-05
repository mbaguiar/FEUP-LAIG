% Asks for row input
read_row(Row):-
    write('Row: '),
    safe_read(Row).

% Asks for column input
read_column(Column):-
    write('Column: '),
    safe_read(Column).

% Asks for Move input
ask_coordinates(Row, Column):-
    read_row(Row),
    read_column(Column).

% Asks for main menu input
read_menu_input(Input):-
    write('Choose game type: '),
    safe_read(Input).

% Asks for board size input
read_board_size_input(Size):-
    write('Choose board size(odd & >= 5 <= 25: '),
    safe_read(Size).

% Catches read exceptions so that invalid entries do not crash the program
% Tests if Input is and integer since all inputs for the program are integers
safe_read(Input):-
    catch(read(Input), _, fail), integer(Input), skip_line.

% Asks for AI difficulty input
read_ai_difficulty_input(AI, Difficulty):-
    write('Difficulty levels:\n'),
    write('1. Random\n'),
    write('2. Optimal Play\n'),
    write('Choose AI '), 
    ((AI =\= 0, write(AI), write('\'s '));
    true),
    write('difficulty: '),
    safe_read(Difficulty).

% Ask for first player input
read_first_player_input(First):-
    write('In Flume, Red always starts. You decide who gets to be Red.\n'),
    write('Red pieces is (1/2): '),
    safe_read(First).

% Simulates a C getchar(), that is, waits for any user input before proceeding
wait_for_input:- write('Press any key to continue.\n'), get_char(_).

