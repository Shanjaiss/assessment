import {message} from 'antd'

type ToastType = 'success' | 'error' | 'info' | 'warning'

export const showToast = (type: ToastType, content: string) => {
  message[type](content)
}