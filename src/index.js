import $ from 'jquery'
import THREE from 'three.js'
import THREEx from 'threex.windowresize'
// const Physijs = require('physijs-browserify')(THREE);

// Physijs.scripts.worker = 'physijs_worker.js';
// Physijs.scripts.ammo = 'ammo.js';
import { Collider, ColliderSystem, ColliderBox3 } from 'threex.colliders';

import Blocker from './components/Blocker/Blocker'
import './components/Map/Map'
import lockPointer from './components/PointerLockControls/PointerLockControls'

import './css/main.css'

import heightmapTexture from './textures/heightmap.png'

const FOV = 75,
    ANGLE = window.innerWidth / window.innerHeight,
    NEAR = 1,
    FAR = 1000;

let windowResize;

let scene, camera, cameraMesh, renderer;
let light, secondaryLight, ray;
let controls, time = Date.now();
let floor;
let colliderSystem, colliders = [];

const body = $("body");
const blocker = new Blocker();
blocker.render();
body.prepend(blocker.el);

init();
animate();

function init() {
    colliderSystem  = new ColliderSystem();

    scene = new THREE.Scene();
    // scene.setGravity(new THREE.Vector3(0, -10, 0));
    scene.fog = new THREE.Fog(0xffffff);

    camera = new THREE.PerspectiveCamera(FOV, ANGLE, NEAR, FAR);
    camera.position.set(0, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraMesh = new THREE.Mesh(
        new THREE.BoxGeometry( 10, 10, 10 ),
        new THREE.MeshLambertMaterial({color: 0xff0000, transparent: false, opacity: 0.0})
    );
    cameraMesh.position.set(0, 0, -20);

    camera.add(cameraMesh);
    cameraMesh.position.set(-1000, 1000, -1000);

    cameraMesh.addEventListener( 'collision', function( other_object, linear_velocity, angular_velocity ) {
        console.log(other_object);
        // `this` is the mesh with the event listener
        // other_object is the object `this` collided with
        // linear_velocity and angular_velocity are Vector3 objects which represent the velocity of the collision
    });

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);

    controls = new THREE.PointerLockControls(camera);
    // controls.getObject().add(cameraMesh);
    cameraMesh.geometry.computeBoundingBox();
    let box = cameraMesh.geometry.boundingBox.clone();
    let collider = new ColliderBox3(cameraMesh, box);
    console.log(collider);
    colliders.push(collider);
    collider.addEventListener('contactEnter', function(otherCollider){
        console.log('contactEnter with', otherCollider)
    });
    collider.addEventListener('contactStay', function(otherCollider){
        console.log('contactStay with', otherCollider)
    });
    collider.addEventListener('contactExit', function(otherCollider){
        console.log('contactExit with', otherCollider)
    });
    collider.addEventListener('contactRemove', function(otherCollider){
        console.log('contactRemove with', otherCollider)
    });

    scene.add(controls.getObject());

    lockPointer(blocker)
        .then(function () {
            controls.enabled = true;
        })
        .catch(function () {
            controls.enabled = false;
        });

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

    let floorMaterial =
        new THREE.MeshPhongMaterial({color: 0xaaaaaa}
    );
    //
    // var i, l;
    // for (i = 0, l = floorGeometry.vertices.length; i < l; i++) {
    //     var vertex = floorGeometry.vertices[i];
    //     vertex.x += Math.random() * 20 - 10;
    //     vertex.y += Math.random();
    //     vertex.z += Math.random() * 20 - 10;
    // }
    //
    // for (i = 0, l = floorGeometry.faces.length; i < l; i++) {
    //     var face = floorGeometry.faces[i];
    //     face.vertexColors[0] = new THREE.Color().setHSL(Math.random() * 0.2 + 0.75, 0.75, Math.random() * 0.25 + 0.75);
    //     face.vertexColors[1] = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    //     face.vertexColors[2] = new THREE.Color().setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
    // }
    //
    //
    // var floorMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
    floor = new THREE.Mesh(
        floorGeometry,
        floorMaterial,
        0 // mass
    );
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

    let map = new THREE.Group();
    let heightmap = new Image();
    heightmap.onload = function () {
        let objects = THREE.ImgToMap(this);
        for (let i = 0; i < objects.length; i++) {
            map.add(objects[i]);
            objects[i].position.y = 20;
            colliders.push(objects[i].collider);
            console.log(objects[i].collider);
        }
    };
    heightmap.src = heightmapTexture;
    map.position.set(-500, 0, -500);
    console.log(colliders);

    scene.add(map);

    body.append(renderer.domElement);
    windowResize = new THREEx.WindowResize(renderer, camera);
}

function animate() {

    colliderSystem.computeAndNotify(colliders);
    // scene.simulate(undefined, 1);
    renderer.render(scene, camera);

    controls.isOnObject(false);

    ray.ray.origin.copy(controls.getObject().position);
    ray.ray.origin.y -= 10;

    controls.update(Date.now() - time);
    // cameraMesh.position.copy(controls.getObject().position);

    time = Date.now();
    requestAnimationFrame(animate);

}
