import $ from 'jquery'
import THREE from 'three.js'
import THREEx from 'threex.windowresize'


import './css/main.css'

const FOV = 75,
    ANGLE = window.innerWidth / window.innerHeight,
    NEAR = 1,
    FAR = 1000;

let windowResize;

let scene, camera, renderer;
let light, secondaryLight, ray;
let floor;

init()
animate()

function init() {

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff);

    camera = new THREE.PerspectiveCamera(FOV, ANGLE, NEAR, FAR);
    camera.position.set(0, 10, 0);
    camera.rotation.set(Math.PI, 0, Math.PI);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);

    light = new THREE.DirectionalLight(0xf9bd62, 1.5);
    light.position.set(1, 1, 1);
    scene.add(light);

    secondaryLight = new THREE.DirectionalLight(0xffffff, 0.75);
    secondaryLight.position.set(-1, -0.5, -1);
    scene.add(secondaryLight);

    ray = new THREE.Raycaster();
    ray.ray.direction.set(0, -1, 0);

    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
    floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    var i, l;
    for (i = 0, l = floorGeometry.vertices.length; i < l; i++) {
        var vertex = floorGeometry.vertices[i];
        vertex.x += Math.random() * 20 - 10;
        vertex.y += Math.random();
        vertex.z += Math.random() * 20 - 10;
    }

    for (i = 0, l = floorGeometry.faces.length; i < l; i++) {
        var face = floorGeometry.faces[i];
        face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.2 + 0.75, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
        face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    }


    var floorMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    scene.add(floor);

    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0)
    );

    var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    var crosshairLineHorizontal = new THREE.Line(lineGeometry, lineMaterial);
    camera.add(crosshairLineHorizontal);
    crosshairLineHorizontal.position.z = -10;

    lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(
        new THREE.Vector3(-0.5, 0.5, 0),
        new THREE.Vector3(0.5, 0.5, 0)
    );

    lineMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000
    });

    var crosshairLineVertical = new THREE.Line(lineGeometry, lineMaterial);
    camera.add(crosshairLineVertical);
    crosshairLineVertical.position.z = -10;
    
    body.append(renderer.domElement);
    windowResize = new THREEx.WindowResize(renderer, camera);
}

function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

}