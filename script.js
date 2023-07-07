angular.module('myApp', []).controller('GameController', ['$scope', function($scope) {
	
	//Chess pieces
	var chessPieces = {
		'white': {
			'king': '&#9812;',
			'queen': '&#9813;',
			'rook': '&#9814;',
			'bishop': '&#9815;',
			'knight': '&#9816;',
			'pawn': '&#9817;'
		},
		'black': {
			'king': '&#9818;',
			'queen': '&#9819;',
			'rook': '&#9820;',
			'bishop': '&#9821;',
			'knight': '&#9822;',
			'pawn': '&#9823;'
		}
	};
	
	//Draw the board game
	$scope.size = 8;
	$scope.widths = [];

	var board = new Array($scope.size);
	
	var i = 0;
	//Draw board
	while(i < $scope.size) { 
		$scope.widths.push(i);
		board[i] = new Array($scope.size); //Create 2d board
		i++;
	}
	
	//Set up game
	$(function() {
		var widthBoard = $('.box').width() * $scope.size;
      $('#board').css('width', widthBoard + '');
		
		//Set up color for boxes, chess pieces
		for(var i = 0; i < $scope.size; i++) {
			for(var j = 0; j < $scope.size; j++) {
				var box = $('#box-' + i + '-' + j);
				if((i + j) % 2 !== 0) {
					box.addClass('light-box');
				} else {
					box.addClass('dark-box');
				}
				setNewBoard(box, i, j);
			}
		}	
	});
	
	var player = 'black';
	//Move chess piece
	var selectedPiece = ''; //Chess piece and color
	var selectedBox = ''; //Id of selected box
	
	//CLick events
	$(function() {
		$('.box').on('click', function() {
			if($(this).hasClass('selected')) { //Undo to select new box
				$(this).removeClass('selected');
				
				$('.box').removeClass('suggest');
				selectedPiece = '';
				selectedBox = '';
				return;
			}
			//Select new box
			if(selectedPiece === '' && selectedBox === '') {
				//Check the right color to play
				if($(this).attr('piece').indexOf(player) >= 0) {
					//Select a piece to move
					selectPiece($(this));
				}
			} else if(selectedPiece !== '' && selectedBox !== '') { //Set up new destination for selected box
				var selectedPieceInfo = selectedPiece.split('-');
				var color = selectedPieceInfo[0];
				var type = selectedPieceInfo[1];
				
				//Select new piece to move if 2 colors are the same
				if($(this).attr('piece').indexOf(color) >= 0) {
					$('#' + selectedBox).removeClass('selected');
					$('.box').removeClass('suggest');
					//Select a piece to move
					selectPiece($(this));
					return;
				}
				
				//Can move if it is valid
				if($(this).hasClass('suggest')) { 
					//Move selected piece successfully
					setPiece($(this), color, type);

					//Delete moved box
					deleteBox($('#' + selectedBox));

					$('.box').removeClass('suggest');
					selectedPiece = '';
					selectedBox = '';

					//Switch player
					if(player === 'black') {
						$('#player').html('WHITE\'S TURN');
						player = 'white';
					} else {
						$('#player').html('BLACK\'S TURN');
						player = 'black';
					}
				}
			}
		});
	});
	
	//Set up piece for clicked box
	var setPiece = function(box, color, type) {
		//Check end game (king is defeated)
		if(box.attr('piece').indexOf('king') >= 0) {
			var winner = player;
			setTimeout(function() {
				alert(winner + ' wins');
			}, 1000);
		}
		
		box.html(chessPieces[color][type]);
		box.addClass('placed');
		box.attr('piece', color + '-' + type);
	}
	
	//Get piece and position of the selected piece
	var selectPiece = function(box) {
		box.addClass('selected');
		selectedBox = box.attr('id');
		selectedPiece = box.attr('piece');
		
		var nextMoves = getNextMoves(selectedPiece, selectedBox);
		suggestNextMoves(nextMoves);
	}
	
	//Returns possible moves of the selected piece
	var getNextMoves = function(selectedPiece, selectedBox) {
		var selectedPieceInfo = selectedPiece.split('-');
		var color = selectedPieceInfo[0];
		var type = selectedPieceInfo[1];
		
		var id = selectedBox.split('-');
		var i = parseInt(id[1]);
		var j = parseInt(id[2]);
		
		var nextMoves = [];
		
		switch(type) {
			case 'pawn':
				if(color === 'black') {
					var moves = [
						[0, 1], [0, 2], [1, 1], [-1, 1]
					];
				} else {
					var moves = [
						[0, -1], [0, -2], [1, -1], [-1, -1]
					];
				}
				nextMoves = getPawnMoves(i, j, color, moves);
				break;
			case 'rook':
				var moves = [
					[0, 1], [0, -1], [1, 0], [-1, 0]
				];
				nextMoves = getQueenMoves(i, j, color, moves);
				break;
			case 'knight':
				var moves = [
					[-1, -2], [-2, -1], [1, -2], [-2, 1],
					[2, -1], [-1, 2], [2, 1], [1, 2]
				];
				nextMoves = getKnightMoves(i, j, color, moves);
				break;
			case 'bishop':
				var moves = [
					[1, 1], [1, -1], [-1, 1], [-1, -1]
				];
				nextMoves = getQueenMoves(i, j, color, moves);
				break;
			case 'queen':
				var moves1 = [
					[1, 1], [1, -1], [-1, 1], [-1, -1]
				];
				var moves2 = [
					[0, 1], [0, -1], [1, 0], [-1, 0]
				];
				nextMoves = getQueenMoves(i, j, color, moves1)
								.concat(getQueenMoves(i, j, color, moves2));
				break;
			case 'king':
				var moves = [
					[1, 1], [1, -1], [-1, 1], [-1, -1],
					[0, 1], [0, -1], [1, 0], [-1, 0]
				];
				nextMoves = getKnightMoves(i, j, color, moves);
				break;
			default: 
				break;
		}
		return nextMoves;
	}
	
	//Calculate next moves for pawn pieces
	var getPawnMoves = function(i, j, color, moves) {
		var nextMoves = [];
		for(var index = 0; index < moves.length; index++) {
			var tI = i + moves[index][0];
			var tJ = j + moves[index][1];
			if( !outOfBounds(tI, tJ) ) {
				var box = $('#box-' + tI + '-' + tJ);
				
				if(index === 0) {
					if(!box.hasClass('placed')) {
						nextMoves.push([tI, tJ]);
					} else {
						index++;
					}
				} else if(index === 1) {
					if( ((color === 'black' && j === 1) ||
					  	  (color === 'white' && j === 6)) &&
					    !box.hasClass('placed')) {
						nextMoves.push([tI, tJ]);
					}
				} else if(index > 1) {
					if(box.attr('piece') !== '' && box.attr('piece').indexOf(color) < 0) {
						nextMoves.push([tI, tJ]);
					}
				}
			}
		}
		return nextMoves;
	}
	
	//Calculate next move of rook, bishop and queen pieces
	var getQueenMoves = function(i, j, color, moves) {
		var nextMoves = [];
		for(var move of moves) {
			var tI = i + move[0];
			var tJ = j + move[1];
			var sugg = true;
			while(sugg && !outOfBounds(tI, tJ)) {
				var box = $('#box-' + tI + '-' + tJ);
				if(box.hasClass('placed')) {
					if(box.attr('piece').indexOf(color) >= 0) {
						sugg = false;
					} else {
						nextMoves.push([tI, tJ]);
						sugg = false;
					}
				}
				if(sugg) {
					nextMoves.push([tI, tJ]);
					tI += move[0];
					tJ += move[1];
				}
			}
		}
		return nextMoves;
	}
	
	//Calculate next moves for knight or king pieces
	var getKnightMoves = function(i, j, color, moves) {
		var nextMoves = [];
		for(var move of moves) {
			var tI = i + move[0];
			var tJ = j + move[1];
			if( !outOfBounds(tI, tJ) ) {
				var box = $('#box-' + tI + '-' + tJ);
				if(!box.hasClass('placed') || box.attr('piece').indexOf(color) < 0) {
					nextMoves.push([tI, tJ]);
				}
			}
		}
		return nextMoves;
	var tI = i + move[0];
			var tJ = j + move[1];
			if( !outOfBounds(tI, tJ) ) {
				var box = $('#box-' + tI + '-' + tJ);
				if(!box.hasClass('placed') || box.attr('piece').indexOf(color) < 0) {
					nextMoves.push([tI, tJ]);
				}
			}}
	
	//Check if position i, j is in the board game
	var outOfBounds = function(i, j) {
		return ( i < 0 || i >= 8 || j < 0 || j >= 8 );
	}
	
	//Show possible moves by add suggestion to boxes
	var suggestNextMoves = function(nextMoves) {
		for(var move of nextMoves) {
			var box = $('#box-' + move[0] + '-' + move[1]);
			box.addClass('suggest');
		}
	}
	
	//Delete selected element
	var deleteBox = function(box) {
		box.removeClass('placed');
		box.removeClass('selected');
		box.removeClass('suggest');
		box.html('');
		box.attr('piece', '');
	}
	
	//Default board state
	var setNewBoard = function(box, i, j) {
		if(j === 7) {
			if(i === 0 || i === 7) {
				setPiece(box, 'white', 'rook');
			} else if(i === 1 || i === 6) {
				setPiece(box, 'white', 'knight');
			} else if(i === 2 || i === 5) {
				setPiece(box, 'white', 'bishop');
			} else if(i === 3) {
				setPiece(box, 'white', 'queen');
			} else if(i === 4) {
				setPiece(box, 'white', 'king');
			}
		} else if(j === 6) {
			setPiece(box, 'white', 'pawn');
		} else if(j === 1) {
			setPiece(box, 'black', 'pawn');
		} else if(j === 0) {
			if(i === 0 || i === 7) {
				setPiece(box, 'black', 'rook');
			} else if(i === 1 || i === 6) {
				setPiece(box, 'black', 'knight');
			} else if(i === 2 || i === 5) {
				setPiece(box, 'black', 'bishop');
			} else if(i === 3) {
				setPiece(box, 'black', 'queen');
			} else if(i === 4) {
				setPiece(box, 'black', 'king');
			}
		}
	}
	
	//Reset game
	$('#restart-btn').on('click', function() {
		resetGame();
	});
	
	var resetGame = function() {
		deleteBox($('.box'));
		
		//Set up color for boxes, chess pieces
		for(var i = 0; i < $scope.size; i++) {
			for(var j = 0; j < $scope.size; j++) {
				var box = $('#box-' + i + '-' + j);
				setNewBoard(box, i, j);
			}
		}
		
		player = 'black';
		selectedPiece = '';
		selectedBox = '';
	}
	
}]);