import type { Group } from 'three'
import type { ObjectCategory } from './investigation'

export type AIStep = 'brief' | 'options' | 'generating' | 'preview' | 'done'

export interface AIRoomItem {
  name: string
  desc: string
  notes: string
  category: ObjectCategory
  type: 'box' | 'octahedron' | 'cylinder' | 'sphere' | 'capsule' | 'custom_model'
  position: [number, number, number]
  rotation: [number, number, number]
  scale: [number, number, number]
  color: string
  roughness: number
  metalness: number
  args: number[]
  isKey?: boolean
  locationBadge?: string
  modelScene?: Group
}

export interface AIOptions {
  theme: 'office' | 'lab' | 'house' | 'warehouse'
  timeOfDay: 'day' | 'night' | 'dawn'
  atmosphere: 'bright' | 'dark' | 'gloomy'
  applyMode: 'replace' | 'append'
  applyLighting: boolean
  includeMarkers: boolean
  includeVictimChalk: boolean
  includeFurniture: boolean
  includeEvidence: boolean
  includeClues: boolean
  includeRedHerrings: boolean
}

export interface AIPreviewStats {
  furniture: number
  evidence: number
  clue: number
  redHerring: number
  total: number
}
