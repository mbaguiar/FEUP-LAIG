class Attribute {
	constructor(name, type, def) {
		this.name = name;
		this.type = type;
		this.default = def;
	}
	
	addRangeRestriction(min, max){
		this.rangeRest = true;
		this.rangeMin = min;
		this.rangeMax = max;
		return this;
	}
}
