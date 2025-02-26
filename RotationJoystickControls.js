import { JoystickControls } from "./JoystickControls"
import { Quaternion, Vector3 } from "three"

/**
 * A joystick controller that can be used to rotate a target mesh
 * in a scene
 */
export class RotationJoystickControls extends JoystickControls {
    /**
     * Used for scaling down the delta value of x and y
     * that is passed to the update function's call back.
     * You can use this to scale down user movement for controlling
     * the speed.
     */
    deltaScale = 0.001
    /**
     * Used for determining which axis the up/down movement of
     * the joystick influences
     */
    verticalMovementAxis = new Vector3(1, 0, 0)
    /**
     * Used for determining which axis the left/right movement of
     * the joystick influences
     */
    horizontalMovementAxis = new Vector3(0, 1, 0)
    /**
     * This is a reference quarternion used for keeping track of the
     * movement
     */
    quaternion = new Quaternion()

    constructor(camera, scene, target) {
        super(camera, scene)
        this.target = target
    }

    /**
     * Converts and applies the angle in radians provided, to the
     * vertical movement axis specified, in the reference quarternion.
     *
     * @param angleInRadians
     */
    rotateVerticalMovement = angleInRadians => {
        this.quaternion.setFromAxisAngle(this.verticalMovementAxis, angleInRadians)

        this.target.quaternion.premultiply(this.quaternion)
    }

    /**
     * Converts and applies the angle in radians provided, to the
     * horizontal movement axis specified, in the reference quarternion.
     *
     * @param angleInRadians
     */
    rotateHorizontalMovement = angleInRadians => {
        this.quaternion.setFromAxisAngle(
            this.horizontalMovementAxis,
            angleInRadians
        )

        this.target.quaternion.premultiply(this.quaternion)
    }

    /**
     * Call this function in the animate loop to update
     * the rotation of the target mesh
     */
    update = () => {
        const joystickMovement = this.getJoystickMovement()

        if (joystickMovement) {
            this.rotateVerticalMovement(joystickMovement.moveY * this.deltaScale)

            this.rotateHorizontalMovement(joystickMovement.moveX * this.deltaScale)
        }
    }
}
