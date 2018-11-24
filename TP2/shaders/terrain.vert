#ifdef GL_ES
precision highp float;
#endif
attribute vec2 aTextureCoord;
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
uniform sampler2D heightMapSampler;
uniform float heightScale;

void main() {

	vTextureCoord = aTextureCoord;
	vec4 color = texture2D(heightMapSampler, vTextureCoord);
	float height = (color.r + color.g + color.b)/3.0;
	vec3 offset = aVertexNormal * height * heightScale;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);


}