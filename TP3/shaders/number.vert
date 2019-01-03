#ifdef GL_ES
precision highp float;
#endif
attribute vec2 aTextureCoord;
attribute vec3 aVertexNormal;
attribute vec3 aVertexPosition;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

void main() {
	vTextureCoord = aTextureCoord;
	vec4 color = texture2D(uSampler, aTextureCoord);
	vec3 offset = aVertexNormal;
	if (color.r > 0.1){
		offset = vec3(0.0, 0.0, 0.0);
	}
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}