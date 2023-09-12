import { type ChannelMessage, type DisplayableMessage } from '@quiet/types'
import { formatMessageDisplayDate } from './formatMessageDisplayDate'

export const displayableMessage = (message: ChannelMessage, nickname: string, isRegistered: boolean): DisplayableMessage => {
  const date = formatMessageDisplayDate(message.createdAt)
  return {
    id: message.id,
    type: message.type,
    message: message.message,
    createdAt: message.createdAt,
    date,
    nickname,
    isRegistered,
    media: message.media,
  }
}
