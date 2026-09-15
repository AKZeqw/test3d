import type { Group } from 'three'

export type Role = 'dosen' | 'mahasiswa'

export type ObjectType = 'box' | 'octahedron' | 'cylinder' | 'sphere' | 'capsule' | 'custom_model'

export type ObjectCategory = 'furniture' | 'evidence' | 'clue' | 'red_herring'

export type LightingMode = 'bright' | 'studio' | 'warm' | 'night'

export type CameraViewPreset = 'top' | 'front' | 'side' | 'isometric' | 'fpv'

export interface InvestigationObject {
  id: string
  name: string
  desc: string
  notes?: string
  isInspected?: boolean
  type: ObjectType
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  roughness: number
  metalness: number
  args: number[]
  modelScene?: Group
}

export interface ObjectPreset {
  type: 'box' | 'cylinder' | 'sphere' | 'capsule' | 'octahedron'
  name: string
  desc: string
  notes: string
  color: string
  args: number[]
  roughness: number
  metalness: number
}
