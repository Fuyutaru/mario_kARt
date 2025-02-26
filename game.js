import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import TWEEN, { Tween } from '@tweenjs/tween.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let container;
let camera, scene, renderer;
let controller;

let reticle;

let hitTestSource = null;
let hitTestSourceRequested = false;

let car;
let mixer;

const clock = new THREE.Clock();

const loader = new GLTFLoader();

function carload(x, y, z) {

    loader.load('/mario_kARt/assets/models/mario_kart.glb', function (gltf) {
        car = new THREE.Group();

        const clone = SkeletonUtils.clone(gltf.scene);
        scene.add(clone);

        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true; // Permet au clone de projeter une ombre
                child.receiveShadow = true; // Permet au clone de recevoir une ombre
            }
        });

        // mixer = new THREE.AnimationMixer(clone);
        clone.position.set(
            x,
            y,
            z
        );

        clone.scale.set(0.1, 0.1, 0.1);
        // clone.rotation.y = Math.PI;

        car.add(clone);
        scene.add(car);
        car.children[0].rotateY(-Math.PI / 2);


    });
}

init();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    //

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    //

    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

    //

    const ball = new THREE.SphereGeometry(0.2, 32, 32).translate(0, 0.1, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0xf11111 });
    const ballmesh = new THREE.Mesh(ball, material);
    scene.add(ballmesh);
    carload(0, 0, 0);

    // if (reticle && reticle.visible) {
    //     reticle.matrix.decompose(ballmesh.position, ballmesh.quaternion, ballmesh.scale);
    //     scene.add(ballmesh);
    // }


    function onSelect() {

        if (reticle.visible) {

            // à mofifier pour faire bouger la boule
            const geometry = new THREE.SphereGeometry(0.2, 32, 32).translate(0, 0.1, 0);
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
            const mesh = new THREE.Mesh(geometry, material);
            reticle.matrix.decompose(mesh.position, ballmesh.quaternion, ballmesh.scale);
            // mesh.scale.y = Math.random() * 2 + 1;
            // scene.add(mesh);

            // reticle.matrix.decompose(ballmesh.position, ballmesh.quaternion, ballmesh.scale);
            // scene.add(ballmesh);

            new TWEEN.Tween(ballmesh.position)
                .to(
                    {
                        x: mesh.position.x,
                        y: mesh.position.y,
                        z: mesh.position.z,
                    },
                    500
                )
                .start()
            if (car) {
                new TWEEN.Tween(car.position)
                    .to(
                        {
                            x: mesh.position.x,
                            y: mesh.position.y,
                            z: mesh.position.z,
                        },
                        500
                    )
                    .start()
            }


        }

    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function animate(timestamp, frame) {
    // ajoute l'update de la boule / car

    if (frame) {

        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        TWEEN.update(timestamp);

        const delta = clock.getDelta();


        if (hitTestSourceRequested === false) {

            session.requestReferenceSpace('viewer').then(function (referenceSpace) {

                session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

                    hitTestSource = source;

                });

            });

            session.addEventListener('end', function () {

                hitTestSourceRequested = false;
                hitTestSource = null;

            });

            hitTestSourceRequested = true;

        }

        if (hitTestSource) {

            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length) {

                const hit = hitTestResults[0];

                reticle.visible = true;
                reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

            } else {

                reticle.visible = false;

            }

        }

    }

    renderer.render(scene, camera);

}