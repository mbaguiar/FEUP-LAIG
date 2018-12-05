% Creates a state State with a board size of Size
% State = [Board, Player, PieceCount]
% create_state(+Size, -State)
create_state(Size, State):-
	setup_board(Size, Board), % create the list of lists representing the board
	append([Board], [1], TempState), % append the starting player value 1: Red pieces
	append(TempState, [[0, 0]], State). % append the piece count for each player

% Get board Board from state State
% board(+State, -Board)
board(State, Board):-
	nth0(0, State, Board).

% Get current player Player from state State
% board(+State, -Player)
player(State, Player):-
	nth0(1, State, Player).

% Get piece count list PieceCount from state State
% board(+State, -PieceCount)
piece_count(State, PieceCount):-
	nth0(2, State, PieceCount).

% Get row number Row from move Move
% row(+Move, -Row)
row_number(Move, Row):-
	nth0(0, Move, Row).

% Get column number Row from move Move
% column(+Move, -Column)
column_number(Move, Column):-
	nth0(1, Move, Column).

% Get row at index NRow of Board
% row(+NRow, +Board, -Row)
row(NRow, Board, Row):-
	nth1(NRow, Board, Row).

% Sets up a board Board with size Size
% setup_board/2: setup_board(+Size, -Board)
setup_board(Size, Board):- setup_board(0, Size, Board, []).

%setup_board/4: setup_board(+Index, +Size, -Board, +Board)
setup_board(Index, Index, Board, Board).
setup_board(Index, Size, Board, NewBoard):-
	Index < Size, % stop condition
	(((Index =:= 0; Index =:= (Size - 1)), setup_wall(Size, Line)); % if row is first or last setup a full wall
	setup_line(Size, Line)), % else setup a playable line
	append(NewBoard, [Line], NewBoard1), % append the line to the board 
	NewIndex is Index + 1, % increment the index
	setup_board(NewIndex, Size, Board, NewBoard1). % recursive call

% Creates a board wall Wall with size Size
% setup_wall(+Size, -Wall)
setup_wall(Size, Wall):-
	length(Wall, Size), % create a list with length = Size
	maplist(=(3), Wall). % number 3 represents an Green cell (wall)

% Creates a board line Line with size Size
% setup_line(+Size, -Line)
setup_line(Size, Line):-
	Delimiter = [3], % playable lines start and end with a Green cell
	PlayableLength is Size - 2, % playable lines have a size of board size - 2
	length(PlayableList, PlayableLength), % create a list with the playable length 
	maplist(=(0), PlayableList), % all of the cells are empty (number 0)
	append(Delimiter, PlayableList, TempLine), % append playable line to the wall cell
	append(TempLine, Delimiter, Line). % append wall cell to the incomplete line

% Places all the possible moves of Board in ListOfMoves
% valid_moves(+Board, -ListOfMoves)
valid_moves(Board, ListOfMoves):-
	findall(Move, valid_move(Move, Board), ListOfMoves).

% Succeeds if Move [Row, Column] is valid move on Board, fails otherwise
% valid_move(+Move, +Board)
valid_move(Move, Board):-
	get_piece(Move, Board, Piece), % get piece at Move [Row, Column]
	Piece =:= 0. % succeed if cell is empty

% Replaces the position I of the list [H|T] with X and puts the new list in [H|R]
replace([_|T], 1, X, [X|T]).
replace([H|T], I, X, [H|R]):- I > 0, I1 is I-1, replace(T, I1, X, R).

% Places piece of player Player in the position Move of the board Board and puts the new board in NewBoard	
% place_piece(+Move, +Board, +Player, -NewBoard)
place_piece(Move, Board, Player, NewBoard):-
	row_number(Move, NRow),
	column_number(Move, NColumn),
	row(NRow, Board, Row),
	replace(Row, NColumn, Player, NewRow),
	replace(Board, NRow, NewRow, NewBoard).

% Gets piece Piece in the position Move of the board Board
% get_piece(+Move, +Board, -Piece)
get_piece(Move, Board, Piece):-
	row_number(Move, NRow), % get row number from Move
	column_number(Move, NColumn), % get column number from Move
	row(NRow, Board, Row), % get row from Board using row number
	nth1(NColumn, Row, Piece). % get piece from Row of Board using column number

% Checks if the piece in the position Move in the board Board makes more than 2 connections with other pieces
% check_connections/2: check_connections(+Move, +Board)
check_connections(Move, Board):- check_connections(Move, [[1, 0], [-1, 0], [0, 1], [0, -1]], Board, 0).

% check_connections/4: check_connections(+Move, +AdjacentCellList, +Board, +Acc)
% Base case: AdjacentCellList is empty
check_connections(_, [], _, Acc):- !, Acc > 2. % If Acc > 2 then more than 2 connections were made

% Recursive case: Connection was made
check_connections(Move, [AdjacentOffset | Tail], Board, Acc):-	
	check_connection(Move, AdjacentOffset, Board), % Check if current adjacent cell makes connection
	NewAcc is Acc + 1, % Increment Acc 
	check_connections(Move, Tail, Board, NewAcc). % Recursive call

% Recursive case: No connection was made
check_connections(Move, [_ | Tail], Board, Acc):- 
	check_connections(Move, Tail, Board, Acc). % Recursive call

% Checks connection with piece in the position Move with the piece in the position Move + Offset in the board Board
% check_connection(+Move, +Ofsset, +Board)
check_connection(Move, Offset, Board):-
	row_number(Move, NRow), % get row number from Move
	column_number(Move, NColumn), % get column number from Move
	nth0(0, Offset, RowOff), % get row offset
	nth0(1, Offset, ColumnOff), % get column offset
	NewRow is (NRow + RowOff), % calculate new row number
	NewColumn is (NColumn + ColumnOff), % calculate new column number
	get_piece([NewRow, NewColumn], Board, Piece), % get adjacent piece
	Piece =\= 0. % succeed if piece is not empty, that is a connection was made

% Updates next player NewPlayer based on the Move made by the player Player in the board Board
% update_player(+Move, +Board, +Player, -NewPlayer)
update_player(Move, Board, Player, NewPlayer):-
	(check_connections(Move, Board), NewPlayer = Player); % if the move made 2+ connections, play again
	(Player =:= 1, NewPlayer is 2); % else change player
	NewPlayer is 1.


% Increments player Player piece count in Pieces, outputs to NewPieces
% update_pieces(+Player, +Pieces, -NewPieces)
update_pieces(Player, Pieces, NewPieces):-
	Pieces = [P1Pieces, P2Pieces], % get both players' piece count
	nth1(Player, Pieces, PlayerPieces), % get the current player count
	NewPieceCount is PlayerPieces + 1, % increment the count
	((Player =:= 1, NewPieces = [NewPieceCount, P2Pieces]); % create new piece count list
	NewPieces = [P1Pieces, NewPieceCount]).

% Updates the state State to NewState based on the move Move
% move(+Move, +State, -NewState)
move(Move, State, NewState):-
	board(State, Board), % get board from state
	player(State, Player), % get player from state
	piece_count(State, Pieces), % get piece count from state
	valid_move(Move, Board), % check if move is valid
	place_piece(Move, Board, Player, NewBoard), % update the board
	update_player(Move, NewBoard, Player, NewPlayer), % update the player
	update_pieces(Player, Pieces, NewPieces), % update the piece count
	NewState = [NewBoard, NewPlayer, NewPieces]. % output new state in NewState
	
move(_, State, NewState):-
	NewState = State, % use old state if move is invalid
	write('Invalid move. Try again.\n').

% Chooses random move from all valid moves
% choose_move(+Board, +AIDifficulty, -Move)
choose_move(Board, 1, Move):-
	valid_moves(Board, ListOfMoves), % get list of valid moves
	random_member(Move, ListOfMoves). % select a random member of the valid moves list

% Chooses optimal move from all valid moves
choose_move(Board, 2, Move):-
	findall(Value-Move, (valid_move(Move, Board), value(Move, Board, Value)), SetOfMoves), % compute value for all valid moves
	choose_best_move(SetOfMoves, Move). % chooses one of the maximum value moves from SetOfMoves

% Gets the move from Player:
% if Player is Human -> get_move(_, 0, Move)
% if Player is Random -> get_move(Board, 1, Move)
% if Player is AI -> get_move(Board, 2, Move)
% get_move/5: get_move(+Board, +P1, +P2, +Player, -Move)
% P1 and P2 represent the type of player
% Player represents the current player (1 or 2)
get_move(Board, P1, P2, Player, Move):-
	(Player =:= 1, get_move(Board, P1, Move));
	(Player =:= 2, get_move(Board, P2, Move)).

% Gets player move
get_move(_, 0, Move):-
	(ask_coordinates(Row, Column), % get user input
	Move = [Row, Column]); % create move
	(write('Invalid move. Try again.\n'), get_move(_, 0, Move)).

% Gets random move
get_move(Board, 1, Move):-
	write('Choosing play ... '), % simulate human play
	choose_move(Board, 1, Move), % get random move
	write('Ready!\n'), print_move(Move),
	wait_for_input. % simulate human play - wait_for_input waits for key press

% Gets AI move
get_move(Board, 2, Move):-
	write('Choosing play ... '), % simulate human play
	choose_move(Board, 2, Move), % get best move
	write('Ready!\n'), print_move(Move),
	wait_for_input. % simulate human play - wait_for_input waits for key press

% Calculates value for Move
% value(+Move, +Board, -Value)
value(Move, Board, Value):-
	(check_connections(Move, Board), Value is 1, !); % if move allows one more play, then it has max value
	(Player is 1, Pieces = [0, 0], % create hipotetical values for the hipotetical move
	move(Move, [Board, Player, Pieces], NewState), % make hipotetical move
	board(NewState, NewBoard), % get hipotetical new board
	% find all new moves that allow the opponent to play at least twice
	findall(NewMove, (valid_move(NewMove, NewBoard), check_connections(NewMove, NewBoard), !), NewListOfMoves), 
	!, length(NewListOfMoves, Length), % get the length of the list of moves
	((Length =:= 0, Value is 0, !); % if there is none, it's a neutral play
	Value is -1)). % else it's a bad play

% Randomly select best move from SetOfMoves
% choose_best_move(+SetOfMoves, -Move)
choose_best_move(SetOfMoves, Move):-
	best_moves(SetOfMoves, BestMoves), % get a list of the maximum value moves
	random_member(Move, BestMoves). % randomly select one of them

% Get list of the maximum value moves
% best_moves(+SetOfMoves, -BestMoves)
best_moves(SetOfMoves, BestMoves):-
	bagof(Move, (member(Value-Move, SetOfMoves), Value =:= 1), BestMoves).

best_moves(SetOfMoves, BestMoves):-
	bagof(Move, (member(Value-Move, SetOfMoves), Value =:= 0), BestMoves).

best_moves(SetOfMoves, BestMoves):-
	bagof(Move, member(_-Move, SetOfMoves), BestMoves).

% Get board value for each player, which is equivalent to piece count
% board_value(+State, -P1Pieces, -P2Pieces)
board_value(State, P1Pieces, P2Pieces):-
	piece_count(State, Pieces),
	Pieces = [P1Pieces, P2Pieces].

% Prints move
% print_move(+Move)
print_move(Move):-
	row_number(Move, NRow),
	column_number(Move, NColumn),
	write('Placing piece at ['), write(NRow), write(', '), write(NColumn), write(']\n').

% Creates state and starts game loop
% Size is the board size, P1 and P2 are the player types
% start_game(+Size, +P1, +P2)
start_game(Size, P1, P2):-
	now(Seed), setrand(Seed), % Set a random seed corresponding to the present time for randomness
    create_state(Size, State), % Create initial game state
    game_loop(P1, P2, State). % Call game loop

% Calculates winner based on piece count Pieces
% winner(+P1Pieces, +P2Pieces, -Winner)
winner(P1Pieces, P2Pieces, Winner):-
	P1Pieces > P2Pieces, Winner is 1.

winner(_, _, Winner):-
	Winner is 2.

% Test if game is over by comparing total pieces with total plays
% game_over(+State, -Winner, -P1Pieces, -P2Pieces)
game_over(State, Winner, P1Pieces, P2Pieces):-
	board_value(State, P1Pieces, P2Pieces), % get board value for both players
	TotalCount is P1Pieces + P2Pieces, % calculate total pieces
	board(State, Board), % get board from state
	length(Board, Size), % get board length
	TotalPlays is ((Size - 2) ** 2), % since board is square and has walls on all sides, plays = (Size-2)^2
	TotalCount =:= TotalPlays, % succeeds if total pieces equals total plays
	winner(P1Pieces, P2Pieces, Winner). % calculates winner

% Recursively calls itself unless game_over succeeds
% P1 and P2 represent the player type 
% game_loop(+P1, +P2, +State)
game_loop(P1, P2, State):-
	board(State, Board), % get board
	player(State, Player), % get player
    ((game_over(State, Winner, P1Pieces, P2Pieces), print_board(Board), print_winner(Winner, P1Pieces, P2Pieces), true, !); % game_over
	display_game(Board, Player), % show board
	get_move(Board, P1, P2, Player, Move), % get move
	move(Move, State, NewState), % apply move
	game_loop(P1, P2, NewState)). % repeat
