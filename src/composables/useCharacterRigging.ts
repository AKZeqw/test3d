import { ref, reactive, markRaw } from 'vue'
import {
  Group,
  Mesh,
  SkeletonHelper,
  AnimationMixer,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type AnimationAction,
  type AnimationClip,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { CharacterModelType, QuickAnimationPreset } from '../types/characterRig'

export function useCharacterRigging() {
  const showCharacterRig = ref(true)
  const characterModelType = ref<CharacterModelType>('player1')
  const characterPosition = reactive<[number, number, number]>([1.6, 0, 0.7])
  const characterRotation = reactive<[number, number, number]>([0, -Math.PI / 1.8, 0])
  const characterScale = ref(1.0)

  const characterScene = ref<Group | null>(null)
  const skeletonHelperRef = ref<SkeletonHelper | null>(null)
  const showSkeletonRig = ref(false)
  const isCharacterLoading = ref(false)
  const showRiggingPanel = ref(false)

  const availableAnimations = ref<string[]>([])
  const currentAnimationName = ref<string>('Idle')
  const animationSpeed = ref<number>(1.0)
  const isAnimationPlaying = ref(true)

  const totalBonesCount = ref<number>(0)
  const skeletonName = ref<string>('')

  let characterMixer: AnimationMixer | null = null
  const animationActions = new Map<string, AnimationAction>()

  const quickAnimationPresets: QuickAnimationPreset[] = [
    { key: 'Idle', label: '🧍 Siaga (Idle)', desc: 'Pose diam waspada' },
    { key: 'Idle_LookAround', label: '🔍 Selidiki TKP', desc: 'Meneliti sekeliling ruangan' },
    { key: 'Adult_TalkGestureActive', label: '🗣️ Berbicara Aktif', desc: 'Menjelaskan analisis temuan' },
    { key: 'Adult_TalkGestureListen', label: '👂 Menyimak Arahan', desc: 'Mendengarkan keterangan saksi' },
    { key: 'Adult_Walk', label: '🚶 Berjalan (Walk)', desc: 'Patroli di area TKP' },
    { key: 'Adult_Run', label: '🏃 Berlari (Run)', desc: 'Mengejar petunjuk darurat' },
    { key: 'Adult_SitTableIdle', label: '🪑 Duduk di Meja', desc: 'Menganalisis berkas di meja' },
    { key: 'Crouch_Idle', label: '🧎 Berjongkok', desc: 'Memeriksa jejak di lantai' },
    { key: 'Adult_Clap', label: '👏 Tepuk Tangan', desc: 'Apresiasi temuan bukti' },
    { key: 'Adult_Happy', label: '💡 Solusi Terpecahkan', desc: 'Reaksi saat bukti cocok' },
    { key: 'Adult_Sad', label: '⚠️ Jalan Buntu', desc: 'Reaksi saat investigasi terhambat' },
  ]

  async function loadRiggedCharacter(modelType: CharacterModelType) {
    isCharacterLoading.value = true
    characterModelType.value = modelType

    const filePath =
      modelType === 'player1'
        ? '/models/Characters/Chess_Player_01.glb'
        : '/models/Characters/Chess_Player_02.glb'

    try {
      const loader = new GLTFLoader()
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(filePath, resolve, undefined, reject)
      })

      if (characterMixer) {
        characterMixer.stopAllAction()
        characterMixer.uncacheRoot(characterMixer.getRoot())
        characterMixer = null
      }
      animationActions.clear()

      const rawScene = gltf.scene as Group
      rawScene.traverse((child: any) => {
        if ((child as Mesh).isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material]
            mats.forEach((mat: any) => {
              if (mat.map) {
                mat.map.colorSpace = SRGBColorSpace
                mat.map.minFilter = LinearMipmapLinearFilter
                mat.map.magFilter = LinearFilter
                mat.map.needsUpdate = true
              }
            })
          }
        }
      })

      let bonesCount = 0
      rawScene.traverse((child: any) => {
        if (child.isBone) bonesCount++
      })
      totalBonesCount.value = bonesCount || 44
      skeletonName.value =
        modelType === 'player1' ? 'Skeleton_ChessPlayer_01' : 'Skeleton_ChessPlayer_02'

      const helper = new SkeletonHelper(rawScene)
      skeletonHelperRef.value = markRaw(helper)

      characterMixer = new AnimationMixer(rawScene)
      const animNames: string[] = []
      if (gltf.animations && gltf.animations.length > 0) {
        gltf.animations.forEach((clip: AnimationClip) => {
          const action = characterMixer!.clipAction(clip)
          animationActions.set(clip.name, action)
          animNames.push(clip.name)
        })
      }
      availableAnimations.value = animNames

      const initialAnim = animNames.includes('Idle') ? 'Idle' : animNames[0] || ''
      if (initialAnim && animationActions.has(initialAnim)) {
        const act = animationActions.get(initialAnim)!
        act.play()
        currentAnimationName.value = initialAnim
      }

      characterScene.value = markRaw(rawScene)
    } catch (err) {
      console.error('Gagal memuat karakter rigged:', err)
    } finally {
      isCharacterLoading.value = false
    }
  }

  function playCharacterAnimation(animName: string, fadeDuration = 0.35) {
    if (!characterMixer || !animationActions.has(animName)) return
    if (currentAnimationName.value === animName && isAnimationPlaying.value) return

    const prevAction = animationActions.get(currentAnimationName.value)
    const nextAction = animationActions.get(animName)!

    nextAction.reset()
    nextAction.enabled = true
    nextAction.timeScale = animationSpeed.value

    if (prevAction && prevAction !== nextAction) {
      nextAction.crossFadeFrom(prevAction, fadeDuration, true)
    }

    nextAction.play()
    currentAnimationName.value = animName
    isAnimationPlaying.value = true
  }

  function toggleSkeletonRig() {
    showSkeletonRig.value = !showSkeletonRig.value
    if (skeletonHelperRef.value) {
      skeletonHelperRef.value.visible = showSkeletonRig.value
      if (showSkeletonRig.value) {
        skeletonHelperRef.value.updateMatrixWorld(true)
      }
    }
  }

  function setAnimationPlaybackSpeed(speed: number) {
    animationSpeed.value = speed
    if (characterMixer) {
      characterMixer.timeScale = isAnimationPlaying.value ? speed : 0
    }
  }

  function togglePlayPauseAnimation() {
    isAnimationPlaying.value = !isAnimationPlaying.value
    if (characterMixer) {
      characterMixer.timeScale = isAnimationPlaying.value ? animationSpeed.value : 0
    }
  }

  function updateMixer(delta: number) {
    if (characterMixer && isAnimationPlaying.value) {
      characterMixer.update(delta)
    }
  }

  return {
    showCharacterRig,
    characterModelType,
    characterPosition,
    characterRotation,
    characterScale,
    characterScene,
    skeletonHelperRef,
    showSkeletonRig,
    isCharacterLoading,
    showRiggingPanel,
    availableAnimations,
    currentAnimationName,
    animationSpeed,
    isAnimationPlaying,
    totalBonesCount,
    skeletonName,
    quickAnimationPresets,
    loadRiggedCharacter,
    playCharacterAnimation,
    toggleSkeletonRig,
    setAnimationPlaybackSpeed,
    togglePlayPauseAnimation,
    updateMixer,
  }
}
