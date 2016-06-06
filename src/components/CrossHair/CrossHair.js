
import THREE from 'three.js'

export default class CrossHair extends THREE.Group {
    constructor() {
        super();
        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 1, 0)
        );

        let lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        let crosshairLineHorizontal = new THREE.Line(lineGeometry, lineMaterial);

        lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(-0.5, 0.5, 0),
            new THREE.Vector3(0.5, 0.5, 0)
        );

        lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        let crosshairLineVertical = new THREE.Line(lineGeometry, lineMaterial);

        super.add(crosshairLineHorizontal);
        super.add(crosshairLineVertical);    
    }
} 
