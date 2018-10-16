const gravity = [
	"minor", "major"
];

const type = [
	"missing", "invalid", "under", "over"
];


class Error {
	constructor(gravity, type){
		this.gravity = gravity;
		this.type = type;
	}
}

class AttributeError extends Error{
	constructor(gravity, type, attr, solution){
		super(gravity, type);
		this.attribute = attr;
		this.solution = solution;
	}

	getMessage(){
		let message = "Attribute '" + this.attribute.name + "' ";
		switch(this.type){
			case "missing":
				message += "is missing.";
				break;
			case "invalid":
				message += "is invalid.";
				break;
			case "under": case "over":
				message += "is off range (" + this.attribute.rangeMin + "-" + this.attribute.rangeMax + ")."
				break;
		}
		if (this.solution) message += " Using default value = '" + this.solution + "'.";
		
		return message;
	}
}