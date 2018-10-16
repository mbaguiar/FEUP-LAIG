class Attribute {
	constructor(name, type, required, def) {
		this.name = name;
		this.type = type;
		this.required = required;
		this.default = def;
	}
	
	validate(a){
		let error;
		if (a === null){
			error = new AttributeError("minor", "missing", this);
		}
		if (this.type === "float" || this.type === "int") {
			if (isNaN(a)) error = new AttributeError("minor", "invalid", this);
			else if (this.rangeRest){
				if (a < this.rangeMin) error = new AttributeError("minor", "under", this);
				else if (a > this.rangeMax) error = new AttributeError("minor", "over", this);
			}
		} else if (this.type === "string")
			if (a === "") error = new AttributeError("minor", "invalid", this);

		if (this.choiceRest)
			if (this.choices.indexOf(a) === -1) error = new AttributeError("minor", "invalid", this);
		
		this.solveError(error, a);
	}

	solveError(err, a){
		if (err == null) return;

		if (this.required) {
			err.solution = false;
		} else if (err.type === "over") {
			a = this.rangeMax;
			err.solution = this.rangeMax;
		} else if (err.type === "under") {
			a = this.rangeMin;
			err.solution = this.rangeMin;
		} else {
			a = this.default;
			err.solution = this.default
		};
		console.log(a);
		throw err;
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
		this.errors = [];
		this.res = {};
	}

	parse(reader, node){
		this.attributes.forEach(attr =>{
			this.res[attr.name] = reader[defaults.typeFunc[attr.type]](node, attr.name, false);
			try {
				attr.validate(this.res[attr.name]);
			} catch (error) {
				this.errors.push(error);
			}
		});
		this.styleRes();
		reader[node.nodeName + "X"] = this.res;
		console.log(this.res);

	}

	styleRes(){
		if (this.outputStyle == null) return;
		if (this.outputStyle instanceof Array){
			let result = [];
			this.outputStyle.forEach(el => {
				result.push(this.res[el]);
			});
			this.res = result;
		}
		
	}
}
