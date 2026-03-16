// import type React from 'react'
// import { useEffect, useRef, useState } from 'react'
// import { useLocalSearchParams } from 'expo-router'

// import NotificationModal from '@/components/general/NotificationModal'
// import { useReadMyModalByType } from '@/lib/api/generated/restApi'
// import type { Modal } from '@/lib/api/generated/restApi.schemas'

// type NotificationModalProviderProps = {
//   children: React.ReactNode
// }

// export const NotificationModalProvider = ({ children }: NotificationModalProviderProps) => {
//   const { modalType } = useLocalSearchParams<{ modalType?: string }>()
//   const hasNavigatedRef = useRef(false)

//   const [modalNotificationData, setModalNotificationData] = useState<Modal>()
//   const [showNotificationModal, setShowNotificationModal] = useState(false)

//   const { data: modalData, isSuccess: isModalFetched } = useReadMyModalByType(
//     { type: modalType ?? '' },
//     { query: { enabled: !!modalType && !hasNavigatedRef.current } },
//   )

//   useEffect(() => {
//     if (modalData && isModalFetched && !hasNavigatedRef.current) {
//       hasNavigatedRef.current = true
//       setModalNotificationData(modalData)
//       setShowNotificationModal(true)
//     }
//   }, [modalData, isModalFetched])

//   // Reset ref when modalType changes
//   useEffect(() => {
//     if (!modalType) {
//       hasNavigatedRef.current = false
//     }
//   }, [modalType])

//   return (
//     <>
//       {children}
//       <NotificationModal
//         open={showNotificationModal}
//         onOpenChange={setShowNotificationModal}
//         onClose={() => setShowNotificationModal(false)}
//         modalData={modalNotificationData}
//       />
//     </>
//   )
// }
