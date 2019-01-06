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
		const query = `move(${move},${state})`;
		return this.sendRequest(query);
	}

	gameOver(o) {
		let state = JSON.stringify(o.state);
		const query = `game_over(${state})`;
		return this.sendRequest(query);
	}

	validMove(o) {
		let board = JSON.stringify(o.board);
		let move = JSON.stringify(o.move);
		const query = `valid_move(${move},${board})`;
		return this.sendRequest(query);
	}

	async getMove(o) {
		let board = JSON.stringify(o.board);
		const query = `choose_move(${board},${o.player})`;
		const res = await this.sendRequest(query);
		return res;
	}

}