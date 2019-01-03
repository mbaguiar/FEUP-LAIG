#ifdef GL_ES
precision highp float;
#endif
attribute vec2 aTextureCoord;
attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
varying vec2 vTextureCoord;

void main() {
	vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}