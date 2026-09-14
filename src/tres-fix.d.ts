import 'three'

declare module 'three' {
  interface Vector3 {
    set(...args: any[]): this
  }
  interface Vector2 {
    set(...args: any[]): this
  }
  interface Vector4 {
    set(...args: any[]): this
  }
}
