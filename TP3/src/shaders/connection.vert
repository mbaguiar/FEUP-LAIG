#ifdef GL_ES
precision highp float;
#endif
attribute vec2 aTextureCoord;
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
varying vec2 vTextureCoord;
uniform float factor;

void main() {
	vTextureCoord = aTextureCoord;
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + factor*0.3*aVertexNormal, 1.0);
}