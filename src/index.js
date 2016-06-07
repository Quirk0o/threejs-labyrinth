import $ from 'jquery'
import THREE from 'three.js'
import './lib/physi.js'
import KeyboardState from './components/TrackballControls/KeyboardState.js'
import WindowResize from './components/WindowResize/WindowResize'
import './components/OrbitControls/OrbitControls'
import './loaders/collada/Animation'
import './loaders/collada/AnimationHandler'
import './loaders/collada/KeyFrameAnimation'

Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

import { imgToMap } from './components/Map/Map'

import './css/main.css'

import heightmapTextureFile from './textures/heightmap.png'
import floorTextureFile from './textures/stone.jpg'
import floorBumpMapFile from './textures/stone-bump.jpg'
import playerAnimation from './models/dude/dude.json'

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
let walls = [];
let player, capsule, bbox;

// the following code is from
//    http://catchvar.com/threejs-animating-blender-models
let animOffset       = 0,   // starting frame of animation
    walking         = false,
    duration        = 1000, // milliseconds to complete animation
    keyframes       = 29,   // total number of animation frames
    interpolation   = duration / keyframes, // milliseconds per frame
    lastKeyframe    = 0,    // previous keyframe
    currentKeyframe = 0;
let animation;

const body = $("body");

init();
animate();

function init() {
    scene = new Physijs.Scene();
    scene.setGravity(new THREE.Vector3(0, -10, 0));
    scene.fog = new THREE.Fog(0x000000);
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

    light = new THREE.DirectionalLight(0xD9DCFA, 1.5);
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

    let floorBumpMap = THREE.ImageUtils.loadTexture(floorBumpMapFile);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 20, 20 );

    let floorMaterial = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({ map: floorTexture, bumpMap: floorBumpMap, shininess: 0, side: THREE.DoubleSide  }),
        .9, .3);

    floor = new Physijs.BoxMesh(new THREE.CubeGeometry(2000, 1, 2000), floorMaterial, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    let heightmap = new Image();
    heightmap.onload = function () {
        let objects = imgToMap(this);
        for (let i = 0; i < objects.length; i++) {
            walls = objects;
            scene.add(objects[i]);
            objects[i].translateX(-600);
            objects[i].translateZ(-500);
            objects[i].position.y = 0;
            objects[i].__dirtyPosition = true;
        }
    };

    heightmap.src = heightmapTextureFile;

    var jsonLoader = new THREE.JSONLoader();
    jsonLoader.load( playerAnimation, (model, materials) => {
        for (var i = 0; i < materials.length; i++)
            materials[i].morphTargets = true;

        var material = new THREE.MeshFaceMaterial( materials );
        player = new THREE.Mesh( model, material );
        player.scale.set(2,2,2);
        player.position.set(0,0,0);
        player.rotation.y = Math.PI;

        bbox = new THREE.BoundingBoxHelper(player, 0x0000ff);
        bbox.update();
        let capsuleGeometry = bbox.geometry;
        let capsuleMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial(
            { color: 0x0000ff, transparent: true, opacity: 0.5 }),
            .6,
            .3);
        capsule = new Physijs.BoxMesh(capsuleGeometry, capsuleMaterial, 1000);
        scene.add(capsule);
        capsule.add(player);
        capsule.position.y = 20;
        capsule.__dirtyPostion = true;
    } );

    body.append(renderer.domElement);
    windowResize = new WindowResize(renderer, camera);
}

function animate() {

    if ( player && walking ) // exists / is loaded
    {
        // Alternate morph targets
        time = new Date().getTime() % duration;
        let keyframe = Math.floor( time / interpolation ) + animOffset;
        if ( keyframe != currentKeyframe )
        {
            player.morphTargetInfluences[ lastKeyframe ] = 0;
            player.morphTargetInfluences[ currentKeyframe ] = 1;
            player.morphTargetInfluences[ keyframe ] = 0;
            lastKeyframe = currentKeyframe;
            currentKeyframe = keyframe;
        }
        player.morphTargetInfluences[ keyframe ] =
            ( time % interpolation ) / interpolation;
        player.morphTargetInfluences[ lastKeyframe ] =
            1 - player.morphTargetInfluences[ keyframe ];
    }

    update();
    scene.simulate();
    renderer.render(scene, camera);

    time = Date.now();
    requestAnimationFrame(animate);

}

var line;
function update()
{
    var moveDistance = 25; // 25 pixels per second
    var rotateAngle = Math.PI / 2;   // pi/2 radians (90 degrees) per second

    // local transformations

    if (capsule) {

        let forward = new THREE.Vector3(0, 0, 1);
        let linearVelocity = new THREE.Vector3(0, 0, 0);
        let angularVelocity = new THREE.Vector3(0, 0, 0);
        // move forwards/backwards/left/right
        if (keyboard.pressed("W")) {
            forward = new THREE.Vector3(0, 0, -1);
            linearVelocity.setZ(moveDistance);
        }
        if (keyboard.pressed("S")) {
            forward = new THREE.Vector3(0, 0, 1);
            linearVelocity.setZ(-moveDistance);
        }

        // rotate left/right/up/down
        var rotation_matrix = new THREE.Matrix4().identity();
        if (keyboard.pressed("A"))
            angularVelocity.setY(rotateAngle);
        // cube.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
        if (keyboard.pressed("D"))
            angularVelocity.setY(-rotateAngle);
        // cube.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);

        var matrix = new THREE.Matrix4();
        matrix.extractRotation(capsule.matrix);
        forward.applyMatrix4(matrix);

        // console.log(direction);)
        linearVelocity = forward.multiplyScalar(linearVelocity.length());
        capsule.setLinearVelocity(linearVelocity);
        capsule.setAngularVelocity(angularVelocity);

        if (linearVelocity.length() > 0) {
            walking = true;
        } else {
            walking = false;
        }

        var relativeCameraOffset = new THREE.Vector3(0, 20, 20);

        var cameraOffset = relativeCameraOffset.applyMatrix4(capsule.matrixWorld);

        var lookAt = new THREE.Vector3(0, 0, 0).copy(capsule.position);
        lookAt.y += 15;

        camera.position.x = cameraOffset.x;
        camera.position.y = cameraOffset.y;
        camera.position.z = cameraOffset.z;
        camera.lookAt(lookAt);
    }
}
