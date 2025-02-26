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
let mixer, mixers;
let object;

let coinsLoaded = false;
let created = false;


const clock = new THREE.Clock();

const loader = new GLTFLoader();
const loader2 = new GLTFLoader();

// function coinload(count) {

//     loader2.load('/mario_kARt/assets/models/coin.glb', function (gltf) {
//         object = new THREE.Group();
//         mixers = []

//         const gridSize = Math.ceil(Math.sqrt(count)); // Détermine la taille de la grille
//         const spacing = 1; // Distance entre les objets
//         const offset = (gridSize - 1) * spacing * 0.5; // Décale pour centrer

//         for (let i = 0; i < count; i++) {
//             const x = i % gridSize;
//             const y = Math.floor(i / gridSize);

//             // Clone proprement le modèle avec les animations
//             const clone = SkeletonUtils.clone(gltf.scene);

//             scene.add(clone);

//             clone.traverse((child) => {
//                 if (child.isMesh) {
//                     child.castShadow = true; // Permet au clone de projeter une ombre
//                     child.receiveShadow = true; // Permet au clone de recevoir une ombre
//                 }
//             });

//             // Ajouter l'animation pour chaque clone
//             const mixer = new THREE.AnimationMixer(clone);
//             console.log(gltf.animations);
//             const action = mixer.clipAction(gltf.animations[0]);
//             action.play();
//             mixers.push(mixer);

//             // Positionnement en grille centrée
//             clone.position.set(
//                 x * spacing - offset,  // Décale pour centrer la grille
//                 0,                     // Niveau du sol
//                 y * spacing - offset   // Décale pour centrer la grille
//             );
//             clone.rotation.y = Math.PI; // Rotation si nécessaire

//             object.add(clone);
//         }

//         scene.add(object);


//     });
// }

function coinload(count, position) {
    loader2.load('/mario_kARt/assets/models/coin.glb', function (gltf) {
        object = new THREE.Group();
        mixers = [];

        const gridSize = Math.ceil(Math.sqrt(count)); // Taille de la grille
        const spacing = 0.5; // Distance entre chaque pièce (à ajuster selon besoin)
        const offset = (gridSize) * spacing * 0.5; // Pour centrer la grille

        for (let i = 0; i < count; i++) {
            const x = i % gridSize;
            const z = Math.floor(i / gridSize);

            const clone = SkeletonUtils.clone(gltf.scene);
            clone.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            // Ajouter l'animation pour le clone
            const mixer = new THREE.AnimationMixer(clone);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
            mixers.push(mixer);

            // Positionnement en grille à partir de la position détectée
            clone.position.set(
                position.x + (x * spacing - offset),
                position.y, // Utilise la hauteur détectée
                position.z + (z * spacing - offset)
            );
            clone.rotation.y = Math.PI; // Rotation éventuelle

            clone.scale.set(0.1, 0.1, 0.1);

            object.add(clone);
        }
        scene.add(object);
    });
}


// coinload(10);


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

        clone.scale.set(0.05, 0.05, 0.05);
        // clone.rotation.y = Math.PI;

        car.add(clone);
        scene.add(car);
        car.children[0].rotateY(-Math.PI / 2);


    });
}

function distance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) + Math.pow(pos1.z - pos2.z, 2));
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


    carload(0, 0, 0);





    function onSelect() {

        if (reticle.visible && car) {

            const position = new THREE.Vector3();
            reticle.matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());



            // à mofifier pour faire bouger la boule
            const geometry = new THREE.SphereGeometry(0.2, 32, 32).translate(0, 0.1, 0);
            const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
            const mesh = new THREE.Mesh(geometry, material);
            // reticle.matrix.decompose(mesh.position, ballmesh.quaternion, ballmesh.scale);
            reticle.matrix.decompose(mesh.position, car.quaternion, car.scale);
            // mesh.scale.y = Math.random() * 2 + 1;
            // scene.add(mesh);

            // reticle.matrix.decompose(ballmesh.position, ballmesh.quaternion, ballmesh.scale);
            // scene.add(ballmesh);


            const direction = new THREE.Vector3().subVectors(position, car.position).normalize();
            direction.y = 0;
            let desiredAngle = Math.atan2(direction.x, direction.z);
            desiredAngle += Math.PI / 2;

            const rotationDuration = 500;
            const positionDuration = 1000;
            const initialAngle = car.rotation.y;


            // new TWEEN.Tween(ballmesh.position)
            //     .to(
            //         {
            //             x: mesh.position.x,
            //             y: mesh.position.y,
            //             z: mesh.position.z,
            //         },
            //         500
            //     )
            //     .start()




            new TWEEN.Tween({ angle: initialAngle })
                .to({ angle: desiredAngle }, rotationDuration)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onUpdate(function (obj) {
                    car.rotation.y = obj.angle;
                })
                .onComplete(function () {
                    new TWEEN.Tween(car.position)
                        .to({ x: position.x, y: position.y, z: position.z }, positionDuration)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                })
                .start();


            // if (car) {
            //     car.lookAt(position);
            //     new TWEEN.Tween(car.position)
            //         .to(
            //             {
            //                 x: position.x,
            //                 y: position.y,
            //                 z: position.z,
            //             },
            //             1000
            //         )
            //         .start()
            // }


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

// function animate(timestamp, frame) {
//     // ajoute l'update de la boule / car

//     if (frame) {

//         const referenceSpace = renderer.xr.getReferenceSpace();
//         const session = renderer.xr.getSession();

//         TWEEN.update(timestamp);

//         const delta = clock.getDelta();
//         if (mixers) mixers.forEach(mixer => mixer.update(delta));


//         if (hitTestSourceRequested === false) {

//             session.requestReferenceSpace('viewer').then(function (referenceSpace) {

//                 session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

//                     hitTestSource = source;

//                 });

//             });

//             session.addEventListener('end', function () {

//                 hitTestSourceRequested = false;
//                 hitTestSource = null;

//             });

//             hitTestSourceRequested = true;

//         }

//         if (hitTestSource) {

//             const hitTestResults = frame.getHitTestResults(hitTestSource);

//             if (hitTestResults.length) {

//                 const hit = hitTestResults[0];

//                 reticle.visible = true;
//                 reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

//             } else {

//                 reticle.visible = false;

//             }

//         }

//     }

//     renderer.render(scene, camera);

// }


const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);


function initAudio() {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/mario_kARt/music/ambiance.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
    });
}

const listener2 = new THREE.AudioListener();
camera.add(listener2);

const sound2 = new THREE.Audio(listener);


function initAudioCoin() {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('/mario_kARt/music/coin.mp3', function (buffer) {
        sound2.setBuffer(buffer);
        sound2.setLoop(false);
        sound2.setVolume(1);
        sound2.play();
    });
}

renderer.xr.addEventListener('sessionstart', initAudio);


function animate(timestamp, frame) {

    if (frame) {

        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        TWEEN.update(timestamp);



        const delta = clock.getDelta();
        if (mixers) mixers.forEach(mixer => mixer.update(delta));

        if (car && object) {
            // console.log("ouiiiiiiiiiiiiiiiiiiiii");
            for (let i = object.children.length - 1; i >= 0; i--) {
                let coin = object.children[i];
                if (distance(coin.position, car.position) < 0.2) {
                    console.log("collision");

                    object.remove(coin); // Retire le coin du groupe

                    console.log(object.children.length);
                    initAudioCoin();
                    // Optionnel : disposer des ressources du coin si nécessaire
                }
            }
        }

        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then(function (refSpace) {
                session.requestHitTestSource({ space: refSpace }).then(function (source) {
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

                // Si les pièces ne sont pas encore chargées, on les charge à la position détectée
                if (!coinsLoaded) {
                    const position = new THREE.Vector3();
                    reticle.matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
                    coinload(400, position);
                    coinsLoaded = true;

                }

                // if (created == false) {
                //     const position = new THREE.Vector3();
                //     reticle.matrix.decompose(position, new THREE.Quaternion(), new THREE.Vector3());
                //     carload(position.x, position.y, position.z);
                //     created = true;
                // }

            } else {
                reticle.visible = false;
            }
        }
    }
    renderer.render(scene, camera);
}
