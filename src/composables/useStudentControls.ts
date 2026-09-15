import { ref, computed, type Ref } from 'vue'
import { Vector3, type PerspectiveCamera } from 'three'
import type { InvestigationObject, Role } from '../types/investigation'

export function useStudentControls(
  currentRole: Ref<Role>,
  objects: InvestigationObject[],
  cameraRef: Ref<any>
) {
  const nearbyObject = ref<InvestigationObject | null>(null)
  const inspectedDossierObject = ref<InvestigationObject | null>(null)

  const inspectedCount = computed(() => objects.filter((o) => o.isInspected).length)

  const keysPressed = {
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  }

  let isMouseDownOnCanvas = false
  let prevMouseX = 0
  let prevMouseY = 0
  let cameraYaw = 0
  let cameraPitch = 0

  function resetStudentCamera(cam?: PerspectiveCamera | null) {
    const activeCam = cam || ((cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera)
    if (activeCam) {
      activeCam.position.set(0, 1.7, 3.8)
      activeCam.lookAt(0, 1.3, 0)
      activeCam.rotation.order = 'YXZ'
      cameraYaw = 0
      cameraPitch = 0
    }
  }

  function openDossier(obj: InvestigationObject) {
    inspectedDossierObject.value = obj
  }

  function closeDossier() {
    inspectedDossierObject.value = null
  }

  function toggleInspected(obj: InvestigationObject) {
    obj.isInspected = !obj.isInspected
  }

  function handleStudentMovement(delta: number) {
    if (inspectedDossierObject.value) return

    const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera
    if (!cam) return

    const isMovingForward = keysPressed.w || keysPressed.ArrowUp
    const isMovingBackward = keysPressed.s || keysPressed.ArrowDown
    const isMovingLeft = keysPressed.a || keysPressed.ArrowLeft
    const isMovingRight = keysPressed.d || keysPressed.ArrowRight

    if (isMovingForward || isMovingBackward || isMovingLeft || isMovingRight) {
      const walkSpeed = 3.6 * delta
      const forward = new Vector3()
      cam.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()

      const right = new Vector3()
      right.crossVectors(forward, new Vector3(0, 1, 0)).normalize()

      const moveDir = new Vector3()
      if (isMovingForward) moveDir.add(forward)
      if (isMovingBackward) moveDir.sub(forward)
      if (isMovingRight) moveDir.add(right)
      if (isMovingLeft) moveDir.sub(right)

      if (moveDir.lengthSq() > 0) {
        moveDir.normalize().multiplyScalar(walkSpeed)

        const nextX = cam.position.x + moveDir.x
        const nextZ = cam.position.z + moveDir.z

        const clampedX = Math.max(-5.2, Math.min(5.2, nextX))
        const clampedZ = Math.max(-3.4, Math.min(5.2, nextZ))

        const insideTableX = clampedX > -2.4 && clampedX < 2.4
        const insideTableZ = clampedZ > -1.4 && clampedZ < 1.4

        if (insideTableX && insideTableZ) {
          const prevX = cam.position.x
          const prevZ = cam.position.z
          if (prevZ < -1.4 || prevZ > 1.4) cam.position.x = clampedX
          if (prevX < -2.4 || prevX > 2.4) cam.position.z = clampedZ
        } else {
          cam.position.x = clampedX
          cam.position.z = clampedZ
        }
      }
    }

    cam.position.y = 1.7
  }

  function updateNearbyInteraction() {
    const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera
    if (!cam) return

    const camPos = cam.position
    const camDir = new Vector3()
    cam.getWorldDirection(camDir)

    let closest: InvestigationObject | null = null
    let minDist = 2.8

    for (const obj of objects) {
      const objPos = new Vector3(obj.position[0], obj.position[1], obj.position[2])
      const dist = camPos.distanceTo(objPos)

      if (dist < minDist) {
        const toObj = objPos.clone().sub(camPos).normalize()
        const dot = camDir.dot(toObj)
        if (dot > 0.45) {
          minDist = dist
          closest = obj
        }
      }
    }

    nearbyObject.value = closest
  }

  function onCanvasPointerDown(e: MouseEvent) {
    if (currentRole.value === 'mahasiswa' && !inspectedDossierObject.value) {
      isMouseDownOnCanvas = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }
  }

  function onWindowPointerMove(e: MouseEvent) {
    if (currentRole.value === 'mahasiswa' && isMouseDownOnCanvas && !inspectedDossierObject.value) {
      const cam = (cameraRef.value?.instance || cameraRef.value) as PerspectiveCamera
      if (!cam) return

      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      prevMouseX = e.clientX
      prevMouseY = e.clientY

      const sensitivity = 0.0032
      cameraYaw -= deltaX * sensitivity
      cameraPitch -= deltaY * sensitivity

      const maxPitch = (70 * Math.PI) / 180
      cameraPitch = Math.max(-maxPitch, Math.min(maxPitch, cameraPitch))

      cam.rotation.order = 'YXZ'
      cam.rotation.y = cameraYaw
      cam.rotation.x = cameraPitch
      cam.rotation.z = 0
    }
  }

  function onWindowPointerUp() {
    isMouseDownOnCanvas = false
  }

  function onKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return
    }

    const k = e.key
    if (k === 'w' || k === 'W') keysPressed.w = true
    if (k === 's' || k === 'S') keysPressed.s = true
    if (k === 'a' || k === 'A') keysPressed.a = true
    if (k === 'd' || k === 'D') keysPressed.d = true
    if (k === 'ArrowUp') keysPressed.ArrowUp = true
    if (k === 'ArrowDown') keysPressed.ArrowDown = true
    if (k === 'ArrowLeft') keysPressed.ArrowLeft = true
    if (k === 'ArrowRight') keysPressed.ArrowRight = true

    if ((k === 'e' || k === 'E') && currentRole.value === 'mahasiswa') {
      if (nearbyObject.value && !inspectedDossierObject.value) {
        openDossier(nearbyObject.value)
      } else if (inspectedDossierObject.value) {
        closeDossier()
      }
    }

    if (k === 'Escape' && inspectedDossierObject.value) {
      closeDossier()
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    const k = e.key
    if (k === 'w' || k === 'W') keysPressed.w = false
    if (k === 's' || k === 'S') keysPressed.s = false
    if (k === 'a' || k === 'A') keysPressed.a = false
    if (k === 'd' || k === 'D') keysPressed.d = false
    if (k === 'ArrowUp') keysPressed.ArrowUp = false
    if (k === 'ArrowDown') keysPressed.ArrowDown = false
    if (k === 'ArrowLeft') keysPressed.ArrowLeft = false
    if (k === 'ArrowRight') keysPressed.ArrowRight = false
  }

  return {
    nearbyObject,
    inspectedDossierObject,
    inspectedCount,
    openDossier,
    closeDossier,
    toggleInspected,
    resetStudentCamera,
    handleStudentMovement,
    updateNearbyInteraction,
    onCanvasPointerDown,
    onWindowPointerMove,
    onWindowPointerUp,
    onKeyDown,
    onKeyUp,
  }
}
