class PrologAPI {
	constructor(port) {
		this.port = port || 8081;
		this.address = `http://localhost:${this.port}/`;
	}

	sendRequest(query) {
		const endpoint = this.address + query;
		return fetch(endpoint, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				}
			})
			.then(data => data.text());
	}
	
	createState() {
		const query = 'create_state';
		return this.sendRequest(query);
	}
	
	move(o) {
		let state = JSON.stringify(o.state);
		let move = JSON.stringify(o.move);
		console.log(state);
		console.log(move);
		const query = `move(${move},${state})`;
		return this.sendRequest(query);
	}

	gameOver(o) {
		let state = JSON.stringify(o.state);
		const query = `game_over(${state})`;
		console.log(query);
		return this.sendRequest(query);
	}

	validMove(o) {
		let board = JSON.stringify(o.board);
		let move = JSON.stringify(o.move);
		const query = `valid_move(${move},${board})`;
		return this.sendRequest(query);
	}

}





/* 
function getPrologRequest(requestString, onSuccess, onError, port) {
	var requestPort = port || 8081;
	var request = new XMLHttpRequest();
	request.open('GET', 'http://localhost:' + requestPort + '/' + requestString, true);

	request.onload = onSuccess || function (data) { console.log("Request successful. Reply: " + data.target.response); };
	request.onerror = onError || function () { console.log("Error waiting for response"); };

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send();
}

function makeRequest() {
	// Get Parameter Values
	var requestString = document.querySelector("#query_field").value;

	// Make Request
	getPrologRequest(requestString, handleReply);
}

//Handle the Reply
function handleReply(data) {
	document.	("#query_result").innerHTML = data.target.response;
} */