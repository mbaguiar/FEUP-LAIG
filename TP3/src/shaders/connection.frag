#ifdef GL_ES
precision highp float;
#endif

uniform float factor;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main() {
    vec4 originalColor = texture2D(uSampler, vTextureCoord);
    vec4 glowColor = texture2D(uSampler2, vTextureCoord);
	originalColor.a = 1.0 - factor/2.0;
	glowColor.a = factor;
	gl_FragColor = originalColor + glowColor;
} 