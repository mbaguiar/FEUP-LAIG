#ifdef GL_ES
precision highp float;
#endif

attribute vec2 aTextureCoord;
attribute vec3 aVertexPosition;
varying vec2 vTextureCoord;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

uniform float timeFactor;
uniform float heightScale;
uniform float texScale;
uniform sampler2D heightMapSampler;

void main() {
	vTextureCoord = aTextureCoord * texScale;
	vec2 coordsOffset = vec2(0.0, 1.0) * 0.00005 * timeFactor;
	vec4 color = texture2D(heightMapSampler, aTextureCoord+coordsOffset);
	float height = (color.r + color.b + color.g)/3.0;
	vec3 heightOffset = vec3(0.0, 1.0, 0.0) * height * heightScale;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + heightOffset , 1.0);

}