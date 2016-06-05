import $ from 'jquery'
import THREE from 'three.js'
import THREEx from 'threex.windowresize'
import KeyboardState from './components/TrackballControls/THREEx.KeyboardState'
import './components/OrbitControls/OrbitControls'
import './loaders/collada/ColladaLoader'
import './loaders/collada/Animation'
import './loaders/collada/AnimationHandler'
import './loaders/collada/KeyFrameAnimation'
import './lib/physi.js'

Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

import './components/Map/Map'

import './css/main.css'

import heightmapTextureFile from './textures/heightmap.png'
import floorTextureFile from './textures/wood-2.jpg'
import modelFile from './models/idle/idle.dae'

const FOV = 75,
    ANGLE = window.innerWidth / window.innerHeight,
    NEAR = 1,
    FAR = 1000;

let windowResize;

let scene, camera, cameraBox, renderer;
let cube;
let light, secondaryLight, ray;
let controls, time = Date.now();
let floor;
let keyboard = new KeyboardState();
let clock = new THREE.Clock();
let collisions = [];

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

    let heightmap = new Image();
    let objects;
    heightmap.onload = function () {
        let objects = THREE.ImgToMap(this);
        for (let i = 0; i < objects.length; i++) {
            scene.add(objects[i]);
            objects[i].position.y = 0;
            var bbox = new THREE.BoundingBoxHelper(objects[i], 0x0000ff);
            bbox.update();
            scene.add(bbox);
        }
    };

    heightmap.src = heightmapTextureFile;

    var loader = new THREE.ColladaLoader();

    loader.load(
        // resource URL
        modelFile,
        // Function when resource is loaded
        function ( collada ) {
            var dae = collada.scene;
            dae.traverse( function ( child ) {
                if ( child instanceof THREE.SkinnedMesh ) {
                    var animation = new THREE.Animation( child, child.geometry.animation );
                    animation.play();
                }
            } );
            dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
            dae.updateMatrix();

            scene.add( dae );
            dae.position.set(0, 0, -100);
        },
        // Function called when download progresses
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        }
    );

    let cubeGeometry = new THREE.CubeGeometry(10, 10, 10);
    let cubeMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    cube = new Physijs.BoxMesh(cubeGeometry, cubeMaterial, 100);
    cube.position.set(0, 5, -100);
    cube.__dirtyPosition = true;
    scene.add(cube);

    cube.addEventListener( 'collision', (other_object) => {
        console.log('Collided with ', other_object);
    });

    body.append(renderer.domElement);
    windowResize = new THREEx.WindowResize(renderer, camera);
}

function animate() {

    update();
    scene.simulate();
    renderer.render(scene, camera);

    // controls.isOnObject(false);

    // ray.ray.origin.copy(controls.getObject().position);
    // ray.ray.origin.y -= 10;

    // controls.update(Date.now() - time);
    // cameraBox.update();

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
