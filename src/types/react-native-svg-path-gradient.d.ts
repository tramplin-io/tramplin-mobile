declare module 'react-native-svg-path-gradient' {
  import type { Component } from 'react'
  import type { PathProps } from 'react-native-svg'

  export interface SvgGradientProps extends PathProps {
    d: string
    colors: string[]
    strokeWidth?: number
    precision?: number
    roundedCorners?: boolean
    percent?: number
  }

  export default class SvgGradient extends Component<SvgGradientProps> {}
}
