import THREE from 'three.js'
import '../../lib/physi'

import textureFile from '../../textures/stone.jpg'
import bumpMapFile from '../../textures/stone-bump.jpg'

function getPixelData(img) {

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var context = canvas.getContext('2d');

    const size = img.width * img.height;
    let data = new Float32Array(size);

    context.drawImage(img, 0, 0);

    for (let i = 0; i < size; i++) {
        data[i] = 0
    }

    var imgd = context.getImageData(0, 0, img.width, img.height);
    var pix = imgd.data;

    let j = 0;
    for (let i = 0; i < pix.length; i += 4) {
        data[j++] = (pix[i + 1] + pix[i + 2] + pix[i + 3])/255;
    }

    return data;
}

export function imgToMap (img) {
    const imgData = getPixelData(img);

    for (var i = 0; i < imgData.length, imgData[i] < 0.5; i++);
    return createWallGeometry(iToP(i));

    function createWallGeometry(root) {

        let points = [];
        let walls = [];
        deactivate(root);
        for (let i = 0; i < 4; i++) {
            let next = nextPoint(root, i);
            if (next && isActive(next)) {
                points.push({a: root, b: next});
            }
        }

        while (points.length > 0) {
            let {a, b} = points.pop();
            deactivate(b);
            let next = nextPoint(a, b);
            if (next && isActive(next)) {
                points.push({a, b: next});
            }
            else
                walls.push({a, b});

            let indices;
            if (a.x == b.x)
                indices = [1, 3];
            if (a.y == b.y)
                indices = [0, 2];

            indices.forEach((i) => {
                let next = nextPoint(b, i);
                if (next && isActive(next))
                    points.push({a: b, b: next});
            });
        }

        let objects = [];
        walls = walls.map(wall => {
            let a = { x: wall.a.y, y: wall.a.x };
            let b = { x: wall.b.y, y: wall.b.x };
            return { a, b };
        });
        walls.forEach((wall) => {
            let width = wall.a.x != wall.b.x ? Math.abs(wall.a.x - wall.b.x) * 10 + 18 : 20;
            let heigth = 80;
            let depth = wall.a.y != wall.b.y ? Math.abs(wall.a.y - wall.b.y) * 10 + 18: 20;
            let vec = { x: (wall.a.x - wall.b.x)/2, y: (wall.a.y - wall.b.y)/2 };
           objects.push(createObject(width, heigth, depth, wall.a.x - vec.x, wall.a.y - vec.y));
        });
        return objects;
    }

    function isActive(point) {
        return imgData[pToI(point)] > 0.5;
    }

    function deactivate(point) {
        imgData[pToI(point)] = 0;
    }

    function iToP(i) {
        let x = Math.floor(i / img.width);
        let y = i - x * img.width;
        return {x, y};
    }

    function pToI(p) {
        return p.x * img.width + p.y;
    }

    function nextPoint(a, b) {
        let point;
        if (b.x !== undefined) {
            if (b.x > a.x)
                point = {x: b.x + 1, y: b.y};
            else if (b.y > a.y)
                point = {x: b.x, y: b.y + 1};
            else if (a.x > b.x)
                point = {x: b.x - 1, y: b.y};
            else if (a.y > b.y)
                point = {x: b.x, y: b.y - 1};
        } else {
            if (b == 0)
                point = {x: a.x, y: a.y + 1};
            else if (b == 1)
                point = {x: a.x + 1, y: a.y};
            else if (b == 2)
                point = {x: a.x, y: a.y - 1};
            else if (b == 3)
                point = {x: a.x - 1, y: a.y};
        }

        if (point.x >= 0 && point.y >= 0 && point.x < img.height && point.y < img.width)
            return point;
        else return null;
    }
};

function createObject(width, height, depth, x, z) {
    let geometry = new THREE.BoxGeometry(width, height, depth);
    let map = THREE.ImageUtils.loadTexture(textureFile);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set( (width > depth ? width : depth) / 32, height / 32 );
    let bumpMap = THREE.ImageUtils.loadTexture(bumpMapFile);
    bumpMap.wrapS = THREE.RepeatWrapping;
    bumpMap.wrapT = THREE.RepeatWrapping;
    bumpMap.repeat.set( (width > depth ? width : depth) / 32, height / 32 );
    let material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({ map, bumpMap, bumpScale: 0.2, side: THREE.DoubleSide }),
        .8,
        .3);
    let cube = new Physijs.BoxMesh(geometry, material, 0);
    cube.position.x = x * 10;
    cube.position.z = z * 10;
    cube._dirtyPosition = true;
    cube.castShadow = true;
    return cube;
}

