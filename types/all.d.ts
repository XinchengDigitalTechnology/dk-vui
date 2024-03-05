import '@vue/runtime-core'
import { Button } from './button'
import { Text } from './text'

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    VButton: typeof Button
    VText: typeof Text
  }
}

export * from './button'
export * from './text'