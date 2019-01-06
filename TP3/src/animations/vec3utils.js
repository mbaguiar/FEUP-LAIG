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

function bezier(out, a, b, c, d, t) {
  let inverseFactor = 1 - t;
  let inverseFactorTimesTwo = inverseFactor * inverseFactor;
  let factorTimes2 = t * t;
  let factor1 = inverseFactorTimesTwo * inverseFactor;
  let factor2 = 3 * t * inverseFactorTimesTwo;
  let factor3 = 3 * factorTimes2 * inverseFactor;
  let factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
