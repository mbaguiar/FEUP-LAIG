class PrologAPI {
	constructor(port) {
		this.port = port || 8081;
		this.address = `http://localhost:${this.port}/`;
	}

	sendRequest(query) {
		const endpoint = this.address + query;
		return new Promise( (resolve, reject) => {
			fetch(endpoint, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				}
			})
			.then(data => data.text())
			.then(data => resolve(data))
			.catch(err => reject(err)); 
		});
	}

	async move(o) {
		const query = `move(${o.move}, ${o.state})`;
		const res = await this.sendRequest(query);
		return res;
	}

	async createState(o) {
		const query = `create_state(${o.size})`;
		const res = await this.sendRequest(query);
		return res;
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
	document.querySelector("#query_result").innerHTML = data.target.response;
} */