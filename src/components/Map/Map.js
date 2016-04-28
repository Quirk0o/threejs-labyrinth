import THREE from 'three.js'

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
        data[j++] = (pix[i] + pix[i + 1] + pix[i + 2])/3/255;
    }

    return data;
}

THREE.ImgToMap = function (img) {
    const imgData = getPixelData(img);
    
    let objects = [];

    let x = 0, z = 0;
    for (let i = 0; i < imgData.length; i++, x += 10) {
        
        if (imgData[i] > 0.5) {
            let geometry = new THREE.BoxGeometry(10, 40, 10);
            let material = new THREE.MeshBasicMaterial({color: 0x000000});
            let cube = new THREE.Mesh(geometry, material);
            cube.position.x = x;
            cube.position.z = z;

            objects.push(cube);
        }

        if (i % img.width == 0) {
            z += 10;
            x = 0;
        }
    }

    return objects;
};

export default THREE.ImgToMap;

