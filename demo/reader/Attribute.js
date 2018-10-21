class Attribute {
	constructor(name, type, def) {
		this.name = name;
		this.type = type;
		this.default = def;
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
