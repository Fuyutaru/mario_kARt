function onSelect() {
    if (reticle.visible && player) {
        const targetPos = new THREE.Vector3();
        const dummyQuat = new THREE.Quaternion();
        const dummyScale = new THREE.Vector3();
        reticle.matrix.decompose(targetPos, dummyQuat, dummyScale);

        const direction = new THREE.Vector3().subVectors(targetPos, player.position);
        direction.y = 0;
        const desiredAngle = Math.atan2(direction.x, direction.z);

        const rotationDuration = 500;
        const positionDuration = 1000;

        const initialAngle = player.rotation.y;
        new TWEEN.Tween({ angle: initialAngle })
            .to({ angle: desiredAngle }, rotationDuration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(function (obj) {
                player.rotation.y = obj.angle;
            })
            .onComplete(function () {
                new TWEEN.Tween(player.position)
                    .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, positionDuration)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onComplete(function () {
                        treeModel.setY(player.position.y);
                    })
                    .start();
            })
            .start();

        console.log("Rotation vers", desiredAngle, "puis déplacement vers", targetPos);
    }
}