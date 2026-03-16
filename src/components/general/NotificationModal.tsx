// import * as React from 'react'
// import { Image, View } from 'react-native'

// import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
// import { Text } from '@/components/ui/text'
// import type { Modal } from '@/lib/api/generated/restApi.schemas'

// // import { RichInputSimple } from '../RichInput'
// import { Button } from '../ui/button'

// type NotificationModalProps = {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onClose: () => void
//   modalData?: Modal
// }

// export const NotificationModal = ({ open, onOpenChange, onClose, modalData }: NotificationModalProps) => {
//   if (!modalData) {
//     return null
//   }

//   const { title, text, imageUrl } = modalData

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="py-10">
//         <View className="w-full">
//           {imageUrl ? (
//             <View className="w-full items-center">
//               <View className="w-[120px] h-[120px] rounded-2xl bg-progressScale mb-6 items-center justify-center">
//                 <Image
//                   source={{ uri: imageUrl }}
//                   className="w-[120px] h-[120px] rounded-2xl"
//                   accessibilityLabel="Notification image"
//                 />
//               </View>
//             </View>
//           ) : null}
//           <Text variant="h2" className="text-center mb-3">
//             {title}
//           </Text>
//           <Text variant="body" className="text-center mb-3">
//             {text}
//           </Text>
//           {/* <View className="w-full">
//             <RichInputSimple
//               html={text ?? ''}
//               containerStyle={{
//                 paddingHorizontal: 0,
//                 paddingVertical: 0,
//                 minHeight: 50,
//               }}
//             />
//           </View> */}
//         </View>

//         <DialogFooter className="w-full mt-6">
//           <Button onPress={onClose} className="w-full min-h-[44px] md:min-h-[50px]">
//             <Text>Close</Text>
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default NotificationModal
