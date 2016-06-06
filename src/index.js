import $ from 'jquery'
import THREE from 'three.js'
import './lib/physi.js'
import KeyboardState from './components/TrackballControls/KeyboardState.js'
import WindowResize from './components/WindowResize/WindowResize'
import './components/OrbitControls/OrbitControls'
import './loaders/obj/OBJLoader'
import './loaders/obj/MTLLoader'

Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

import { imgToMap } from './components/Map/Map'

import './css/main.css'

import heightmapTextureFile from './textures/heightmap.png'
import floorTextureFile from './textures/wood-2.jpg'
import modelFile from './models/stickFigure/Stick_Figure_by_Swp.DAE'
import objFile from './models/stickFigure/Stick_Figure_by_Swp.OBJ'
import mtlFile from './models/stickFigure/Stick_Figure_by_Swp.mtl'

const FOV = 75,
    ANGLE = window.innerWidth / window.innerHeight,
    NEAR = 1,
    FAR = 1000;

let windowResize;

let scene, camera, renderer;
let cube;
let light, secondaryLight, ray;
let controls, time = Date.now();
let floor;
let keyboard = new KeyboardState();

// custom global variables
let player;

// the following code is from
//    http://catchvar.com/threejs-animating-blender-models
let animOffset       = 0,   // starting frame of animation
    walking         = false,
    duration        = 1000, // milliseconds to complete animation
    keyframes       = 20,   // total number of animation frames
    interpolation   = duration / keyframes, // milliseconds per frame
    lastKeyframe    = 0,    // previous keyframe
    currentKeyframe = 0;

const body = $("body");

init();
animate();

function init() {
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -10, 0));
    scene.fog = new THREE.Fog(0xffffff);
    scene.addEventListener(
        'update',
        function () {
            scene.simulate(undefined, 1);
        }
    );

    camera = new THREE.PerspectiveCamera(FOV, ANGLE, NEAR, FAR);

    camera.position.set(0, 20, 50);
    camera.lookAt(scene.position);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);

    controls = new THREE.OrbitControls(camera);

    light = new THREE.DirectionalLight(0xf9bd62, 1.5);
    light.position.set(1, 1, 1);
    scene.add(light);

    secondaryLight = new THREE.DirectionalLight(0xffffff, 0.75);
    secondaryLight.position.set(-1, -0.5, -1);
    scene.add(secondaryLight);

    ray = new THREE.Raycaster();
    ray.ray.direction.set(0, -1, 0);

    let floorTexture = THREE.ImageUtils.loadTexture(floorTextureFile);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 20, 20 );

    let floorMaterial = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({ map: floorTexture, side: THREE.DoubleSide  }),
        .9, .3);

    floor = new Physijs.BoxMesh(new THREE.CubeGeometry(2000, 1, 2000), floorMaterial, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    let heightmap = new Image();
    heightmap.onload = function () {
        let objects = imgToMap(this);
        for (let i = 0; i < objects.length; i++) {
            scene.add(objects[i]);
            objects[i].position.y = 0;
        }
    };

    heightmap.src = heightmapTextureFile;

    let cubeGeometry = new THREE.CubeGeometry(10, 10, 10);
    let cubeMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    cube = new Physijs.BoxMesh(cubeGeometry, cubeMaterial, 100);
    cube.position.set(0, 5, -100);
    cube.__dirtyPosition = true;
    scene.add(cube);

    body.append(renderer.domElement);
    windowResize = new WindowResize(renderer, camera);
}

function animate() {

    update();
    scene.simulate();
    renderer.render(scene, camera);

    time = Date.now();
    requestAnimationFrame(animate);

}

function update()
{
    var moveDistance = 200; // 200 pixels per second
    var rotateAngle = Math.PI / 2;   // pi/2 radians (90 degrees) per second

    // local transformations

    let direction = new THREE.Vector3(0, 0, 1);
    let linearVelocity = new THREE.Vector3(0, 0, 0);
    let angularVelocity = new THREE.Vector3(0, 0, 0);
    // move forwards/backwards/left/right
    if ( keyboard.pressed("W") ) {
        direction = new THREE.Vector3(0, 0, -1);
        linearVelocity.setZ(moveDistance);
    }
    if ( keyboard.pressed("S") ) {
        direction = new THREE.Vector3(0, 0, 1);
        linearVelocity.setZ(-moveDistance);
    }

    // rotate left/right/up/down
    var rotation_matrix = new THREE.Matrix4().identity();
    if ( keyboard.pressed("A") )
        angularVelocity.setY(rotateAngle);
        // cube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
    if ( keyboard.pressed("D") )
        angularVelocity.setY(-rotateAngle);
        // cube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);

    var matrix = new THREE.Matrix4();
    matrix.extractRotation( cube.matrix );
    direction.applyMatrix4(matrix);

    // console.log(direction);)
    linearVelocity = direction.multiplyScalar(linearVelocity.length());
    cube.setLinearVelocity(linearVelocity);
    cube.setAngularVelocity(angularVelocity);

    var relativeCameraOffset = new THREE.Vector3(0,20,50);

    var cameraOffset = relativeCameraOffset.applyMatrix4( cube.matrixWorld );

    camera.position.x = cameraOffset.x;
    camera.position.y = cameraOffset.y;
    camera.position.z = cameraOffset.z;
    camera.lookAt( cube.position );
}
