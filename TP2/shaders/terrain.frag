#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 textureColor;
uniform sampler2D textureSampler;

void main() {
    gl_FragColor = texture2D(textureSampler, vTextureCoord);
}