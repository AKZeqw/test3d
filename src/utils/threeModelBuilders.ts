import {
  Group,
  Mesh,
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
} from 'three'
import { markRaw } from 'vue'
import type { AIRoomItem } from '../types/aiRoom'

export function buildExecutiveDeskModel(): Group {
  const group = new Group()
  const woodMat = new MeshStandardMaterial({ color: '#451a03', roughness: 0.45, metalness: 0.1 })
  const deskTop = new Mesh(new BoxGeometry(2.4, 0.08, 1.3), woodMat)
  deskTop.position.set(0, 0.72, 0)
  deskTop.castShadow = true
  deskTop.receiveShadow = true
  group.add(deskTop)

  // Kaki meja panel samping kiri & kanan
  const leftLeg = new Mesh(new BoxGeometry(0.08, 0.72, 1.26), woodMat)
  leftLeg.position.set(-1.14, 0.36, 0)
  leftLeg.castShadow = true
  group.add(leftLeg)

  const rightLeg = new Mesh(new BoxGeometry(0.08, 0.72, 1.26), woodMat)
  rightLeg.position.set(1.14, 0.36, 0)
  rightLeg.castShadow = true
  group.add(rightLeg)

  // Panel belakang meja (modesty panel)
  const backPanel = new Mesh(new BoxGeometry(2.2, 0.45, 0.04), woodMat)
  backPanel.position.set(0, 0.45, -0.6)
  group.add(backPanel)

  // Bantalan kulit hitam di atas meja (desk blotter pad)
  const padMat = new MeshStandardMaterial({ color: '#0f172a', roughness: 0.8, metalness: 0.05 })
  const blotter = new Mesh(new BoxGeometry(0.9, 0.005, 0.55), padMat)
  blotter.position.set(0, 0.763, 0.05)
  group.add(blotter)

  // Lemari laci di sisi kanan bawah
  const drawerMat = new MeshStandardMaterial({ color: '#311005', roughness: 0.5, metalness: 0.1 })
  const drawerBlock = new Mesh(new BoxGeometry(0.48, 0.65, 1.15), drawerMat)
  drawerBlock.position.set(0.85, 0.33, 0)
  drawerBlock.castShadow = true
  group.add(drawerBlock)

  // Gagang laci kuningan emas
  const brassMat = new MeshStandardMaterial({ color: '#d97706', roughness: 0.2, metalness: 0.9 })
  for (let i = 0; i < 3; i++) {
    const handle = new Mesh(new BoxGeometry(0.14, 0.02, 0.03), brassMat)
    handle.position.set(0.85, 0.18 + i * 0.2, 0.59)
    group.add(handle)
  }

  return markRaw(group)
}

export function buildLaptopModel(): Group {
  const group = new Group()
  const bodyMat = new MeshStandardMaterial({ color: '#334155', roughness: 0.3, metalness: 0.8 })

  // Base / Keyboard
  const base = new Mesh(new BoxGeometry(0.38, 0.015, 0.26), bodyMat)
  base.position.set(0, 0.0075, 0)
  base.castShadow = true
  group.add(base)

  // Trackpad
  const trackpadMat = new MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.6 })
  const trackpad = new Mesh(new BoxGeometry(0.11, 0.002, 0.075), trackpadMat)
  trackpad.position.set(0, 0.016, 0.07)
  group.add(trackpad)

  // Keyboard keys area
  const kbMat = new MeshStandardMaterial({ color: '#0f172a', roughness: 0.7, metalness: 0.2 })
  const kbArea = new Mesh(new BoxGeometry(0.34, 0.003, 0.12), kbMat)
  kbArea.position.set(0, 0.016, -0.04)
  group.add(kbArea)

  // Screen Lid (dibuka 108 derajat)
  const screenLid = new Group()
  screenLid.position.set(0, 0.015, -0.13)
  screenLid.rotation.x = -1.2

  const lidMesh = new Mesh(new BoxGeometry(0.38, 0.25, 0.012), bodyMat)
  lidMesh.position.set(0, 0.125, 0)
  lidMesh.castShadow = true
  screenLid.add(lidMesh)

  // Bezel hitam
  const bezelMat = new MeshStandardMaterial({ color: '#020617', roughness: 0.6 })
  const bezel = new Mesh(new BoxGeometry(0.37, 0.24, 0.002), bezelMat)
  bezel.position.set(0, 0.125, 0.006)
  screenLid.add(bezel)

  // Screen glow biru neon menyala
  const screenMat = new MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 0.75,
    roughness: 0.1,
  })
  const display = new Mesh(new BoxGeometry(0.34, 0.21, 0.003), screenMat)
  display.position.set(0, 0.125, 0.008)
  screenLid.add(display)

  group.add(screenLid)
  return markRaw(group)
}

export function buildEvidenceMarkerModel(_num: number): Group {
  const group = new Group()
  const yellowMat = new MeshStandardMaterial({
    color: '#eab308',
    roughness: 0.4,
    metalness: 0.1,
  })
  const cardGeo = new BoxGeometry(0.1, 0.14, 0.006)

  const leftCard = new Mesh(cardGeo, yellowMat)
  leftCard.position.set(0, 0.065, -0.026)
  leftCard.rotation.x = 0.4
  leftCard.castShadow = true
  group.add(leftCard)

  const rightCard = new Mesh(cardGeo, yellowMat)
  rightCard.position.set(0, 0.065, 0.026)
  rightCard.rotation.x = -0.4
  rightCard.castShadow = true
  group.add(rightCard)

  const badgeMat = new MeshStandardMaterial({ color: '#090d16', roughness: 0.9 })
  const badgeFront = new Mesh(new BoxGeometry(0.06, 0.07, 0.008), badgeMat)
  badgeFront.position.set(0, 0.065, 0.028)
  badgeFront.rotation.x = -0.4
  group.add(badgeFront)

  const badgeBack = new Mesh(new BoxGeometry(0.06, 0.07, 0.008), badgeMat)
  badgeBack.position.set(0, 0.065, -0.028)
  badgeBack.rotation.x = 0.4
  group.add(badgeBack)

  return markRaw(group)
}

export function buildVictimChalkOutlineModel(): Group {
  const group = new Group()
  const chalkMat = new MeshStandardMaterial({
    color: '#f8fafc',
    emissive: '#ffffff',
    emissiveIntensity: 0.35,
    roughness: 0.95,
  })

  const head = new Mesh(new CylinderGeometry(0.16, 0.16, 0.005, 16), chalkMat)
  head.position.set(0, 0.003, -0.85)
  group.add(head)

  const torso = new Mesh(new BoxGeometry(0.42, 0.005, 0.75), chalkMat)
  torso.position.set(0, 0.003, -0.38)
  group.add(torso)

  const armL = new Mesh(new BoxGeometry(0.1, 0.005, 0.42), chalkMat)
  armL.position.set(-0.35, 0.003, -0.55)
  armL.rotation.y = 0.6
  group.add(armL)

  const armR = new Mesh(new BoxGeometry(0.1, 0.005, 0.48), chalkMat)
  armR.position.set(0.38, 0.003, -0.48)
  armR.rotation.y = -0.75
  group.add(armR)

  const legL = new Mesh(new BoxGeometry(0.12, 0.005, 0.75), chalkMat)
  legL.position.set(-0.18, 0.003, 0.42)
  legL.rotation.y = 0.2
  group.add(legL)

  const legR = new Mesh(new BoxGeometry(0.12, 0.005, 0.72), chalkMat)
  legR.position.set(0.22, 0.003, 0.4)
  legR.rotation.y = -0.3
  group.add(legR)

  return markRaw(group)
}

export function buildBloodPoolModel(): Group {
  const group = new Group()
  const bloodMat = new MeshStandardMaterial({
    color: '#7f1d1d',
    roughness: 0.05,
    metalness: 0.2,
  })

  const mainPuddle = new Mesh(new CylinderGeometry(0.4, 0.44, 0.006, 24), bloodMat)
  mainPuddle.position.set(0, 0.004, 0)
  mainPuddle.scale.set(1.3, 1, 0.85)
  group.add(mainPuddle)

  const droplets = [
    [-0.45, 0.004, 0.25, 0.15],
    [0.5, 0.004, -0.2, 0.13],
    [-0.3, 0.004, -0.35, 0.11],
    [0.35, 0.004, 0.35, 0.1],
    [0.65, 0.004, 0.1, 0.06],
    [-0.6, 0.004, -0.15, 0.07],
  ]
  droplets.forEach(([x, y, z, r]) => {
    const d = new Mesh(new CylinderGeometry(r, r, 0.005, 16), bloodMat)
    d.position.set(x, y, z)
    group.add(d)
  })

  return markRaw(group)
}

export function buildBookcaseModel(): Group {
  const group = new Group()
  const woodMat = new MeshStandardMaterial({ color: '#3d1c06', roughness: 0.65 })

  const uprightGeo = new BoxGeometry(0.08, 2.6, 0.42)
  const leftUp = new Mesh(uprightGeo, woodMat)
  leftUp.position.set(-0.86, 1.3, 0)
  leftUp.castShadow = true
  group.add(leftUp)

  const rightUp = new Mesh(uprightGeo, woodMat)
  rightUp.position.set(0.86, 1.3, 0)
  rightUp.castShadow = true
  group.add(rightUp)

  const backPanel = new Mesh(
    new BoxGeometry(1.8, 2.6, 0.03),
    new MeshStandardMaterial({ color: '#271103', roughness: 0.8 })
  )
  backPanel.position.set(0, 1.3, -0.19)
  group.add(backPanel)

  const shelfGeo = new BoxGeometry(1.68, 0.05, 0.38)
  for (let i = 0; i < 5; i++) {
    const shelf = new Mesh(shelfGeo, woodMat)
    shelf.position.set(0, 0.1 + i * 0.58, 0)
    shelf.castShadow = true
    shelf.receiveShadow = true
    group.add(shelf)

    if (i < 4) {
      const bookColors = ['#991b1b', '#1e3a8a', '#065f46', '#78350f', '#374151', '#b45309']
      for (let b = 0; b < 10; b++) {
        const bookH = 0.28 + (b % 3) * 0.05
        const bookW = 0.07 + (b % 2) * 0.03
        const book = new Mesh(
          new BoxGeometry(bookW, bookH, 0.26),
          new MeshStandardMaterial({
            color: bookColors[(i * 3 + b) % bookColors.length],
            roughness: 0.7,
          })
        )
        const posX = -0.7 + b * 0.15
        if (i === 1 && b === 4) {
          book.position.set(posX, 0.1 + i * 0.58 + bookH / 2, 0.03)
          book.rotation.z = -0.28
        } else {
          book.position.set(posX, 0.1 + i * 0.58 + bookH / 2, 0.03)
        }
        book.castShadow = true
        group.add(book)
      }
    }
  }

  return markRaw(group)
}

export function buildFilingCabinetModel(): Group {
  const group = new Group()
  const metalMat = new MeshStandardMaterial({ color: '#475569', metalness: 0.75, roughness: 0.25 })

  const body = new Mesh(new BoxGeometry(0.65, 1.85, 0.6), metalMat)
  body.position.set(0, 0.925, 0)
  body.castShadow = true
  body.receiveShadow = true
  group.add(body)

  const handleMat = new MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.1 })
  for (let d = 0; d < 4; d++) {
    const isPulledOut = d === 2
    const zOffset = isPulledOut ? 0.15 : 0.015
    const drawerFace = new Mesh(
      new BoxGeometry(0.58, 0.4, 0.02),
      new MeshStandardMaterial({
        color: isPulledOut ? '#334155' : '#475569',
        metalness: 0.75,
        roughness: 0.3,
      })
    )
    drawerFace.position.set(0, 0.24 + d * 0.44, 0.3 + zOffset)
    drawerFace.castShadow = true
    group.add(drawerFace)

    const handle = new Mesh(new BoxGeometry(0.18, 0.03, 0.04), handleMat)
    handle.position.set(0, 0.24 + d * 0.44, 0.32 + zOffset)
    group.add(handle)

    const labelBadge = new Mesh(
      new BoxGeometry(0.1, 0.05, 0.01),
      new MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 })
    )
    labelBadge.position.set(0, 0.32 + d * 0.44, 0.31 + zOffset)
    group.add(labelBadge)
  }

  return markRaw(group)
}

export function buildFallenChairModel(): Group {
  const group = new Group()
  const leatherMat = new MeshStandardMaterial({ color: '#090d16', roughness: 0.4 })
  const chromeMat = new MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.85, roughness: 0.2 })

  const seat = new Mesh(new BoxGeometry(0.56, 0.1, 0.52), leatherMat)
  seat.position.set(0, 0.45, 0)
  seat.castShadow = true
  group.add(seat)

  const back = new Mesh(new BoxGeometry(0.52, 0.65, 0.08), leatherMat)
  back.position.set(0, 0.8, -0.24)
  back.rotation.x = 0.12
  back.castShadow = true
  group.add(back)

  const headrest = new Mesh(new BoxGeometry(0.32, 0.18, 0.08), leatherMat)
  headrest.position.set(0, 1.18, -0.28)
  group.add(headrest)

  const armL = new Mesh(new BoxGeometry(0.08, 0.25, 0.36), leatherMat)
  armL.position.set(-0.31, 0.62, 0)
  group.add(armL)
  const armR = new Mesh(new BoxGeometry(0.08, 0.25, 0.36), leatherMat)
  armR.position.set(0.31, 0.62, 0)
  group.add(armR)

  const column = new Mesh(new CylinderGeometry(0.04, 0.04, 0.4, 16), chromeMat)
  column.position.set(0, 0.22, 0)
  group.add(column)

  for (let s = 0; s < 5; s++) {
    const angle = (s * Math.PI * 2) / 5
    const spoke = new Mesh(new BoxGeometry(0.05, 0.04, 0.3), chromeMat)
    spoke.position.set(Math.sin(angle) * 0.15, 0.04, Math.cos(angle) * 0.15)
    spoke.rotation.y = angle
    group.add(spoke)
  }

  group.rotation.set(0.35, 0.5, 1.4)
  group.position.set(0, 0.22, 0)

  return markRaw(group)
}

export function buildVintageDeskLampModel(): Group {
  const group = new Group()
  const brassMat = new MeshStandardMaterial({ color: '#ca8a04', metalness: 0.85, roughness: 0.25 })

  const base = new Mesh(new CylinderGeometry(0.1, 0.12, 0.025, 24), brassMat)
  base.position.set(0, 0.0125, 0)
  base.castShadow = true
  group.add(base)

  const stem = new Mesh(new CylinderGeometry(0.015, 0.015, 0.35, 16), brassMat)
  stem.position.set(0, 0.19, 0)
  group.add(stem)

  const shade = new Mesh(
    new BoxGeometry(0.24, 0.1, 0.13),
    new MeshStandardMaterial({
      color: '#065f46',
      roughness: 0.15,
      metalness: 0.1,
      emissive: '#10b981',
      emissiveIntensity: 0.4,
    })
  )
  shade.position.set(0, 0.36, 0.05)
  shade.rotation.x = 0.25
  group.add(shade)

  return markRaw(group)
}

export function attachCompositeModel(item: AIRoomItem, customType?: string) {
  const nameLower = (item.name || '').toLowerCase()
  const cType = (customType || '').toLowerCase()

  if (
    cType === 'executive_desk' ||
    (nameLower.includes('meja') && (nameLower.includes('eksekutif') || nameLower.includes('kerja') || nameLower.includes('kantor')))
  ) {
    item.type = 'custom_model'
    item.modelScene = buildExecutiveDeskModel()
    item.position[1] = 0
  } else if (cType === 'laptop' || nameLower.includes('laptop') || nameLower.includes('komputer')) {
    item.type = 'custom_model'
    item.modelScene = buildLaptopModel()
  } else if (
    cType === 'fallen_chair' ||
    (nameLower.includes('kursi') && (nameLower.includes('jatuh') || nameLower.includes('tumbang') || nameLower.includes('eksekutif')))
  ) {
    item.type = 'custom_model'
    item.modelScene = buildFallenChairModel()
  } else if (cType === 'chalk_outline' || nameLower.includes('siluet') || nameLower.includes('kapur') || nameLower.includes('korban')) {
    item.type = 'custom_model'
    item.modelScene = buildVictimChalkOutlineModel()
    item.position[1] = 0.006
  } else if (
    cType === 'blood_puddle' ||
    (nameLower.includes('darah') && (nameLower.includes('genangan') || nameLower.includes('noda') || nameLower.includes('tumpahan')))
  ) {
    item.type = 'custom_model'
    item.modelScene = buildBloodPoolModel()
    item.position[1] = 0.008
  } else if (cType.startsWith('evidence_marker') || nameLower.includes('penanda bukti') || nameLower.includes('marker')) {
    item.type = 'custom_model'
    const numMatch = (cType + ' ' + nameLower).match(/[#_](\d+)/)
    const num = numMatch ? parseInt(numMatch[1], 10) : 1
    item.modelScene = buildEvidenceMarkerModel(Math.min(Math.max(num, 1), 5))
  } else if (cType === 'bookshelf' || (nameLower.includes('rak') && nameLower.includes('buku'))) {
    item.type = 'custom_model'
    item.modelScene = buildBookcaseModel()
    item.position[1] = 0
  } else if (cType === 'filing_cabinet' || (nameLower.includes('lemari') && nameLower.includes('arsip'))) {
    item.type = 'custom_model'
    item.modelScene = buildFilingCabinetModel()
    item.position[1] = 0
  } else if (cType === 'desk_lamp' || cType === 'banker_lamp' || (nameLower.includes('lampu') && (nameLower.includes('meja') || nameLower.includes('banker')))) {
    item.type = 'custom_model'
    item.modelScene = buildVintageDeskLampModel()
    item.position[1] = 0.765
  }
}
