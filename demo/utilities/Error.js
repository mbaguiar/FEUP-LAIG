const gravity = [
	"minor", "major"
];

const type = [
	"missing", "invalid", "upper", "lower"
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
	}

	getMessage(){
		let message = "Attribute '" + attr.name + "' ";
		switch(this.type){
			case "missing":
				message += "is missing.";
				break;
			case "invalid":
				message += "is invalid.";
				break;
			case "upper": case "lower":
				message += "is off range (" + attr.rangeMin + "-" + attr.rangeMax + ")."
				break;
		}
		if (solution) message += " Using default value = '" + solution + "'.";
		
		return message;
	}
}