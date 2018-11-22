#ifdef GL_ES
precision highp float;
#endif
attribute vec2 aTextureCoord;
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;
varying vec4 textureColor;

uniform sampler2D heightMapSampler;
uniform float heightScale;

void main() {

	vec3 offset = vec3(0.0, 0.0, 0.0);
	vTextureCoord = aTextureCoord;

	textureColor = texture2D(heightMapSampler, vTextureCoord);
	float height = (textureColor.r + textureColor.g + textureColor.b)/3.0;
	offset = aVertexNormal * height * heightScale;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition+offset, 1.0);


}