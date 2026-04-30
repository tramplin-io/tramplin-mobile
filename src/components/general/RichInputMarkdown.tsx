import { View } from 'react-native'
import Markdown, { type MarkdownProps } from 'react-native-markdown-display'
import { useCSSVariable } from 'uniwind'

const FONT_REGULAR = 'GT-Standard-M-Standard-Regular'
const FONT_BOLD = 'GT-Standard-M-Standard-Bold'

interface RichInputMarkdownProps {
  markdown: string
  className?: string
}

export function RichInputMarkdown({ markdown = '', className }: Readonly<RichInputMarkdownProps>) {
  const contentPrimary = useCSSVariable('--color-content-primary') as string
  const contentSecondary = useCSSVariable('--color-content-secondary') as string
  const contentTertiary = useCSSVariable('--color-content-tertiary') as string
  const brandPrimary = useCSSVariable('--color-brand-primary') as string

  const markdownStyles: MarkdownProps['style'] = {
    body: {
      fontFamily: FONT_REGULAR,
      fontSize: 15,
      lineHeight: 22,
      color: contentTertiary,
      fontWeight: '400',
    },
    paragraph: {
      fontFamily: FONT_REGULAR,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400',
      color: contentTertiary,
      marginTop: 0,
      marginBottom: 4,
    },
    heading1: {
      fontFamily: FONT_BOLD,
      fontSize: 26,
      lineHeight: 33,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 0,
      marginBottom: 18,
    },
    heading2: {
      fontFamily: FONT_BOLD,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 0,
      marginBottom: 16,
    },
    heading3: {
      fontFamily: FONT_BOLD,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 0,
      marginBottom: 14,
    },
    heading4: {
      fontFamily: FONT_BOLD,
      fontSize: 18,
      lineHeight: 23,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 0,
      marginBottom: 12,
    },
    heading5: {
      fontFamily: FONT_REGULAR,
      fontSize: 17,
      lineHeight: 18,
      fontWeight: '500',
      color: contentSecondary,
      marginTop: 0,
      marginBottom: 8,
    },
    heading6: {
      fontFamily: FONT_REGULAR,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: '500',
      color: contentSecondary,
      marginTop: 0,
      marginBottom: 4,
    },
    strong: {
      fontFamily: FONT_BOLD,
      fontWeight: '600',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecorationLine: 'line-through',
    },
    link: {
      color: brandPrimary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      borderLeftWidth: 2,
      borderLeftColor: contentTertiary,
      paddingLeft: 12,
      color: contentSecondary,
    },
    bullet_list: {
      paddingLeft: 8,
      marginBottom: 4,
    },
    ordered_list: {
      paddingLeft: 8,
      marginBottom: 4,
    },
    list_item: {
      marginBottom: 6,
      flexDirection: 'row',
    },
    bullet_list_icon: {
      color: contentTertiary,
      fontSize: 15,
      lineHeight: 22,
      marginRight: 6,
    },
    ordered_list_icon: {
      color: contentTertiary,
      fontSize: 15,
      lineHeight: 22,
      marginRight: 6,
    },
    code_inline: {
      fontFamily: FONT_REGULAR,
      fontSize: 13,
      color: contentSecondary,
    },
    fence: {
      fontFamily: FONT_REGULAR,
      fontSize: 13,
      color: contentSecondary,
    },
  }

  return (
    <View className={className}>
      <Markdown style={markdownStyles}>{markdown}</Markdown>
    </View>
  )
}

export default RichInputMarkdown
