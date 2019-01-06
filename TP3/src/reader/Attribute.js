class Attribute {
	constructor(name, type, def, opt) {
		this.name = name;
		this.type = type;
		this.default = def;
		this.optional = opt;
	}
	
	/**
	 * Adds range restriction to Attribute
	 * @param  {lower boundary} min
	 * @param  {higher boundary} max
	 */
	addRangeRestriction(min, max){
		this.rangeRest = true;
		this.rangeMin = min;
		this.rangeMax = max;
		return this;
	}
}
