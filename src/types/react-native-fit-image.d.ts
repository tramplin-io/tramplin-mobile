declare module 'react-native-fit-image' {
  import type { Component } from 'react'
  import type { ImageStyle, ImageSourcePropType, StyleProp } from 'react-native'

  export interface FitImageProps {
    source: ImageSourcePropType
    indicator?: boolean
    style?: StyleProp<ImageStyle>
    accessible?: boolean
    accessibilityLabel?: string
  }

  export default class FitImage extends Component<FitImageProps> {}
}
