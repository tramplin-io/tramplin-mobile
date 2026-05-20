import { View } from 'react-native'
import FitImage from 'react-native-fit-image'
import Markdown, { type MarkdownProps, type RenderRules } from 'react-native-markdown-display'
import { useCSSVariable } from 'uniwind'

const FONT_REGULAR = 'GT-Standard-M-Standard-Regular'
const FONT_BOLD = 'GT-Standard-M-Standard-Bold'

interface RichInputMarkdownProps {
  markdown: string
  className?: string
}

// react-native-markdown-display spreads { key, ...rest } into FitImage which triggers a React warning.
// Override to pass key directly to FitImage instead of via spread.
const markdownRules: RenderRules = {
  image: (node, _children, _parent, styles, allowedImageHandlers, defaultImageHandler) => {
    const { src, alt } = node.attributes as { src: string; alt?: string }
    const show = allowedImageHandlers.some((h) => src.toLowerCase().startsWith(h.toLowerCase()))
    if (!show && defaultImageHandler === null) return null
    const uri = show ? src : `${defaultImageHandler}${src}`
    return (
      <FitImage
        key={node.key}
        indicator={false}
        style={[styles._VIEW_SAFE_image, { borderRadius: 10, overflow: 'hidden' }]}
        source={{ uri }}
        accessible={!!alt}
        accessibilityLabel={alt}
      />
    )
  },
}

export function RichInputMarkdown({ markdown = '', className }: Readonly<RichInputMarkdownProps>) {
  const contentPrimary = useCSSVariable('--color-content-primary') as string
  const contentSecondary = useCSSVariable('--color-content-secondary') as string
  const contentArticleBody = useCSSVariable('--color-content-article-body') as string
  const brandPrimary = useCSSVariable('--color-brand-primary') as string

  const markdownStyles: MarkdownProps['style'] = {
    body: {
      fontFamily: FONT_REGULAR,
      fontSize: 15,
      lineHeight: 22,
      color: contentArticleBody,
      fontWeight: '400',
    },
    paragraph: {
      fontFamily: FONT_REGULAR,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400',
      color: contentArticleBody,
      marginTop: 8,
      marginBottom: 8,
    },
    heading1: {
      // fontFamily: FONT_BOLD,
      fontSize: 26,
      lineHeight: 33,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 0,
      marginBottom: 18,
    },
    heading2: {
      // fontFamily: FONT_BOLD,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 16,
      marginBottom: 16,
    },
    heading3: {
      // fontFamily: FONT_BOLD,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 14,
      marginBottom: 14,
    },
    heading4: {
      // fontFamily: FONT_BOLD,
      fontSize: 18,
      lineHeight: 23,
      fontWeight: '600',
      color: contentPrimary,
      marginTop: 14,
      marginBottom: 12,
    },
    heading5: {
      fontFamily: FONT_REGULAR,
      fontSize: 17,
      lineHeight: 18,
      fontWeight: '500',
      color: contentSecondary,
      marginTop: 8,
      marginBottom: 8,
    },
    heading6: {
      fontFamily: FONT_REGULAR,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: '500',
      color: contentSecondary,
      marginTop: 4,
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
      borderLeftWidth: 4,
      // biome-ignore lint/suspicious/noExplicitAny: blockquote renders as ViewStyle at runtime but library types it as TextStyle
      borderLeftColor: brandPrimary as any,
      paddingLeft: 12,
      color: contentArticleBody,
      marginTop: 12,
      marginBottom: 12,
      marginLeft: 0,
      backgroundColor: 'transparent',
    },
    bullet_list: {
      paddingLeft: 4,
      marginBottom: 4,
    },
    ordered_list: {
      paddingLeft: 4,
      marginBottom: 4,
    },
    list_item: {
      marginBottom: 6,
      flexDirection: 'row',
    },
    bullet_list_icon: {
      color: contentArticleBody,
      fontSize: 15,
      lineHeight: 22,
      marginRight: 6,
    },
    ordered_list_icon: {
      color: contentArticleBody,
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
      <Markdown style={markdownStyles} rules={markdownRules}>
        {markdown}
      </Markdown>
    </View>
  )
}

export default RichInputMarkdown
