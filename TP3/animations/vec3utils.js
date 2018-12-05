function angle(a, b) {
	let tempA = vec3.fromValues(a[0], a[1], a[2]);
	let tempB = vec3.fromValues(b[0], b[1], b[2]);
	vec3.normalize(tempA, tempA);
	vec3.normalize(tempB, tempB);
	let cosine = vec3.dot(tempA, tempB);
	if(cosine > 1.0) {
	  return 0;
	}
	else if(cosine < -1.0) {
	  return Math.PI;
	} else {
	  return Math.acos(cosine);
	}
}

function scaleAndAdd(a, b, scale) {
	let out = [];
	out[0] = a[0] + (b[0] * scale);
	out[1] = a[1] + (b[1] * scale);
	out[2] = a[2] + (b[2] * scale);
	return out;
}
