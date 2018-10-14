class Attribute {
	constructor(name, type, required, def) {
		this.name = name;
		this.type = type;
		this.required = required;
		this.default = def;
	}
	
	isValid(a){
		if (a == null){
			
		}
		
		if ()

	}

	useDefault(a){
		if (this.default != null) a = this.default;
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
		if (this.outputStyle  == null) return res;
		if (this.outputStyle  instanceof Array){
			let result = [];
			this.outputStyle.forEach(el => {
				result.push(res[el]);
			});
			return result;
		}
		
	}
}
