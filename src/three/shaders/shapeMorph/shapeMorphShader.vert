varying vec2 vUv;

varying vec4 worldPosition;

void main() {
    vec4 position4 = vec4( position, 1.0 );

    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * position4;
    worldPosition = modelMatrix * vec4( position, 1.0 );
}