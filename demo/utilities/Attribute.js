class Attribute {
	constructor(name, type, required, def) {
		this.name = name;
		this.type = type;
		this.required = required;
		this.default = def;
	}
	
	check(a){
		if (a === null){
			return false;
		}
		if (this.type === "float" || this.type === "int") {
			if (isNaN(a)) return false;
			else if (this.rangeRest){
				if (a < this.rangeMin || a > this.rangeMax) return false;
			}
		} else if (this.type === "string")
			if (a === "") return false;

		if (this.choiceRest)
			if (this.choices.indexOf(a) === -1) return false;
		
		return true;
	}

	addRangeRestriction(min, max){
		this.rangeRest = true;
		this.rangeMin = min;
		this.rangeMax = max;
	}

	addChoicesRestriction(choices){
		this.choiceRest = true;
		this.choices = choices;
	}
}

class AttributeSet {
	constructor(attr, style){
		this.attributes = attr;
		this.outputStyle = style;
	}

	styleRes(res){
		if (this.outputStyle === null) return res;
		if (this.outputStyle instanceof Array){
			let result = [];
			this.outputStyle.forEach(el => {
				result.push(res[el]);
			});
			return result;
		}
		
	}
}
