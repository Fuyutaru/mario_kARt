import * as CANNON from 'cannon-es';

import * as THREE from 'three'

import CannonDebugger from 'cannon-es-debugger';

import {
    GLTFLoader
} from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(75, aspect, 1, 1000);
const sceneCamera = new THREE.PerspectiveCamera(100, aspect, 1, 1000);
sceneCamera.position.set(0, 30, 0);




const light = new THREE.AmbientLight(0xffffff, 1.0); // soft white light
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);


const clock = new THREE.Clock();
window.addEventListener('resize', () => onWindowResize(), false);

// const size = 10;
// const divisions = 10;

// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

function animatescene() {
    renderer.setAnimationLoop(animatescene);
    render();
    controls.update();

}

function render() {
    // renderer.render(scene, sceneCamera);
    renderer.render(scene, camera);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animatescene();


const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -200, 0),
});

const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    // infinte geometric plane
    shape: new CANNON.Plane(),
});

const cannonDebugger = new CannonDebugger(scene, world);


groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
// groundBody.quaternion.setFromEuler(-Math.PI / 2, Math.PI / 24, 0);
world.addBody(groundBody);

const carBody = new CANNON.Body({
    mass: 5,
    position: new CANNON.Vec3(0, 6, 0),
    shape: new CANNON.Box(new CANNON.Vec3(4, 0.5, 2)),
});

const vehicle = new CANNON.RigidVehicle({
    chassisBody: carBody,
});

const mass = 1;
const axisWidth = 5;
const wheelShape = new CANNON.Sphere(1);
const wheelMaterial = new CANNON.Material('wheel');
const down = new CANNON.Vec3(0, -1, 0);

const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody1.addShape(wheelShape);
wheelBody1.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody1,
    position: new CANNON.Vec3(-2, 0, axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody2.addShape(wheelShape);
wheelBody2.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody2,
    position: new CANNON.Vec3(-2, 0, -axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody3.addShape(wheelShape);
wheelBody3.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody3,
    position: new CANNON.Vec3(2, 0, axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});

const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial });
wheelBody4.addShape(wheelShape);
wheelBody4.angularDamping = 0.4;
vehicle.addWheel({
    body: wheelBody4,
    position: new CANNON.Vec3(2, 0, -axisWidth / 2),
    axis: new CANNON.Vec3(0, 0, 1),
    direction: down,
});




document.addEventListener('keydown', (event) => {
    const maxSteerVal = Math.PI / 4;
    const maxForce = 10;

    switch (event.key) {
        case 'z':
        case 'ArrowUp':
            vehicle.setWheelForce(maxForce * 15, 0);
            vehicle.setWheelForce(maxForce * 15, 1);
            break;

        case 's':
        case 'ArrowDown':
            vehicle.setWheelForce(-maxForce * 10, 0);
            vehicle.setWheelForce(-maxForce * 10, 1);
            break;

        case 'q':
        case 'ArrowLeft':
            vehicle.setSteeringValue(maxSteerVal, 0);
            vehicle.setSteeringValue(maxSteerVal, 1);
            break;

        case 'd':
        case 'ArrowRight':
            vehicle.setSteeringValue(-maxSteerVal, 0);
            vehicle.setSteeringValue(-maxSteerVal, 1);
            break;
    }
});

// reset car force to zero when key is released
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'z':
        case 'ArrowUp':
            vehicle.setWheelForce(0, 0);
            vehicle.setWheelForce(0, 1);
            break;

        case 's':
        case 'ArrowDown':
            vehicle.setWheelForce(0, 0);
            vehicle.setWheelForce(0, 1);
            break;

        case 'q':
        case 'ArrowLeft':
            vehicle.setSteeringValue(0, 0);
            vehicle.setSteeringValue(0, 1);
            break;

        case 'd':
        case 'ArrowRight':
            vehicle.setSteeringValue(0, 0);
            vehicle.setSteeringValue(0, 1);
            break;
    }
});


const boxGeometry = new THREE.BoxGeometry(8, 1, 4);
const boxMaterial = new THREE.MeshNormalMaterial();
const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(boxMesh);

const sphereGeometry1 = new THREE.SphereGeometry(1);
const sphereMaterial1 = new THREE.MeshNormalMaterial();
const sphereMesh1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
scene.add(sphereMesh1);

const sphereGeometry2 = new THREE.SphereGeometry(1);
const sphereMaterial2 = new THREE.MeshNormalMaterial();
const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
scene.add(sphereMesh2);

const sphereGeometry3 = new THREE.SphereGeometry(1);
const sphereMaterial3 = new THREE.MeshNormalMaterial();
const sphereMesh3 = new THREE.Mesh(sphereGeometry3, sphereMaterial3);
scene.add(sphereMesh3);

const sphereGeometry4 = new THREE.SphereGeometry(1);
const sphereMaterial4 = new THREE.MeshNormalMaterial();
const sphereMesh4 = new THREE.Mesh(sphereGeometry4, sphereMaterial4);
scene.add(sphereMesh4);


const loader = new GLTFLoader();
const loader2 = new GLTFLoader();

// let carModel;
let car;
let map;



loader.load(
    // resource URL
    'assets/models/mario_kart.glb',
    // called when the resource is loaded
    function (gltf) {
        // carModel = gltf.scene;
        // scene.add(gltf.scene);
        car = gltf.scene;
        // car.childen[0].position.set(0, 0, 0);

        scene.add(car);

        car.children[0].rotateY(-Math.PI / 2);
        // car.children.position.set(boxMesh.position.x, boxMesh.position.y - 2, boxMesh.position.z);
        console.log(car.children[0])





        gltf.animations; // Array<THREE.AnimationClip>
        gltf.scene; // THREE.Group
        gltf.scenes; // Array<THREE.Group>
        // gltf.cameras; // Array<THREE.Camera>
        gltf.asset; // Object

    },
    // called while loading is progressing
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
);



loader2.load(
    // resource URL
    'assets/models/mario_kart_circuit.glb',
    // called when the resource is loaded
    function (gltf) {
        // carModel = gltf.scene;
        // scene.add(gltf.scene);
        map = gltf.scene;
        scene.add(map);
        // map.position.set(boxMesh.position.x, boxMesh.position.y, boxMesh.position.z);
        // map.scale.set(70, 70, 70);

        // car.position.copy(carBody.position);
        // car.quaternion.copy(carBody.quaternion);
        // console.log(gltf.scene.children[0].children[0].children[80].geometry);
        // console.log(gltf.scene.children[0].children[0]);

        const array = gltf.scene.children[0].children[0].children;

        array.forEach(element => {
            // console.log("je suis dans la boucleeeeeeeeeeeeeeeeeee");
            const geometry = element.geometry;
            const vertices = geometry.attributes.position.array;
            const indices = geometry.index.array;
            // geometry.attributes.position.set(boxMesh.position.x, boxMesh.position.y - 2, boxMesh.position.z);

            const scale = 15;
            for (let i = 0; i < vertices.length; i++) {
                vertices[i] *= scale;
            }

            // console.log("je suis après les vertiiiiiiiiiiiiiiice");

            // Create a CANNON.Trimesh shape
            const shape = new CANNON.Trimesh(vertices, indices);

            // Create a CANNON.Body with the Trimesh shape


            const groundBody = new CANNON.Body({
                // type: CANNON.body.DYNAMIC,
                type: CANNON.Body.AWAKE,
                mass: 0, // Static body
                shape: shape,
            });

            // console.log("j'ai le grounddddddddddddddddddddddddddd");
            // console.log(groundBody);

            groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
            // groundBody.scale.set(70, 70, 70);


            // Set the position of the ground body to match the map
            // groundBody.position.copy(map.position);

            // Add the ground body to the world
            world.addBody(groundBody);
        });

        map.visible = true;

        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Group
        // gltf.scenes; // Array<THREE.Group>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object

    },
    // called while loading is progressing
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened oui');

    }
);

vehicle.addToWorld(world);



boxMesh.visible = false;
sphereMesh1.visible = false;
sphereMesh2.visible = false;
sphereMesh3.visible = false;
sphereMesh4.visible = false;


const offset = new CANNON.Vec3(10, 0, 0);

boxMesh.add(camera);
boxMesh.add(sceneCamera);
sceneCamera.lookAt(boxMesh.position);
sceneCamera.position.copy(carBody.position.vadd(new CANNON.Vec3(-10, 0, 0)));
camera.lookAt(boxMesh.position);
camera.position.copy(carBody.position.vadd(offset));

// if (car) {
//     sceneCamera.lookAt(car.position).vadd(new CANNON.Vec3(10, 1000, 0));
// }



const animate = () => {
    world.fixedStep();
    cannonDebugger.update();

    // const carPosition = carBody.position.clone();
    // const cameraOffset = new CANNON.Vec3(0, 5, -10);
    // camera.position.copy(carPosition.vadd(cameraOffset));
    // camera.lookAt(carPosition);


    if (map) {
        map.visible = true;
    } else {
        console.log("Map is not defined");
    }


    if (car) {
        car.position.copy(carBody.position).add(new CANNON.Vec3(0, -1, 0));
        car.quaternion.copy(carBody.quaternion);
        // sceneCamera.lookAt(car.position);
    }



    boxMesh.position.copy(carBody.position);
    boxMesh.quaternion.copy(carBody.quaternion);
    sphereMesh1.position.copy(wheelBody1.position);
    sphereMesh1.quaternion.copy(wheelBody1.quaternion);
    sphereMesh2.position.copy(wheelBody2.position);
    sphereMesh2.quaternion.copy(wheelBody2.quaternion);
    sphereMesh3.position.copy(wheelBody3.position);
    sphereMesh3.quaternion.copy(wheelBody3.quaternion);
    sphereMesh4.position.copy(wheelBody4.position);
    sphereMesh4.quaternion.copy(wheelBody4.quaternion);



    camera.lookAt(boxMesh.position);
    sceneCamera.lookAt(boxMesh.position);


    // camera.position.copy(carBody.position.vadd(offset));

    renderer.render(scene, sceneCamera);
    renderer.render(scene, camera);

    window.requestAnimationFrame(animate);

};
animate();


