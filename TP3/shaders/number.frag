#ifdef GL_ES
precision highp float;
#endif

uniform vec3 color;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

void main() {
	vec4 texColor = texture2D(uSampler, vTextureCoord);
	vec4 appliedColor = vec4(color, 1.0);
	/* if (texColor.r > 0.1){
		appliedColor = vec4(1.0, 1.0, 1.0, 1.0);
	} */
	gl_FragColor = appliedColor;
} 