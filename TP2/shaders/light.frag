#ifdef GL_ES
precision highp float;
#endif

uniform float timeFactor;

void main() {
    gl_FragColor = vec4(abs(sin(timeFactor * 0.0025)), 0, 0, 1);
}