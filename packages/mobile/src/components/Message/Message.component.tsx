import React, { FC, ReactNode } from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { Typography } from '../Typography/Typography.component'
import { MessageProps } from './Message.types'
import { Jdenticon } from '../Jdenticon/Jdenticon.component'
import { appImages } from '../../assets'
import { MessageType, DisplayableMessage } from '@quiet/types'
import { AUTODOWNLOAD_SIZE_LIMIT } from '@quiet/state-manager'
import { UploadedImage } from '../UploadedImage/UploadedImage.component'
import { UploadedFile } from '../UploadedFile/UploadedFile.component'
import { FileActionsProps } from '../UploadedFile/UploadedFile.types'
import Linkify from 'react-linkify'
import { MathJaxSvg } from 'react-native-mathjax-html-to-svg'
import { defaultTheme } from '../../styles/themes/default.theme'

export const Message: FC<MessageProps & FileActionsProps> = ({
  data, // Set of messages merged by sender
  downloadStatus,
  downloadFile,
  cancelDownload,
  openImagePreview,
  openUrl,
  pendingMessages,
}) => {
  const componentDecorator = (decoratedHref: string, decoratedText: string, key: number): ReactNode => {
    return (
      <Typography fontSize={14} color={'link'} onPress={() => openUrl(decoratedHref)} key={key}>
        {decoratedText}
      </Typography>
    )
  }

  const renderMessage = (message: DisplayableMessage, pending: boolean) => {
    switch (message.type) {
      case 2: // MessageType.Image (cypress tests incompatibility with enums)
        const size = message.media?.size
        const fileDisplay = !size || size < AUTODOWNLOAD_SIZE_LIMIT
        return (
          <>
            {fileDisplay && message.media ? (
              <UploadedImage media={message.media} openImagePreview={openImagePreview} />
            ) : (
              <UploadedFile
                message={message}
                downloadStatus={downloadStatus}
                downloadFile={downloadFile}
                cancelDownload={cancelDownload}
              />
            )}
          </>
        )
      case 4: // MessageType.File
        return (
          <UploadedFile
            message={message}
            downloadStatus={downloadStatus}
            downloadFile={downloadFile}
            cancelDownload={cancelDownload}
          />
        )
      default:
        const color = pending ? 'lightGray' : 'main'

        const containsLatex = /\$\$(.+)\$\$/.test(message.message)
        if (containsLatex) {
          // Input sanitization. react-native-mathjax-html-to-svg throws error when provided with empty "$$$$"
          const sanitizedMathJax = message.message.replace(/\$\$(\s*)\$\$/g, '$$_$$')
          return (
            // @ts-expect-error (Property 'children' does not exist on type 'IntrinsicAttributes & Props')
            <MathJaxSvg fontSize={14} color={defaultTheme.palette.typography[color]} fontCache={true}>
              {sanitizedMathJax}
            </MathJaxSvg>
          )
        }
        return (
          <Typography fontSize={14} color={color} testID={message.message}>
            <Linkify componentDecorator={componentDecorator}>{message.message}</Linkify>
          </Typography>
        )
    }
  }

  const representativeMessage = data[0]

  const info = representativeMessage.type === MessageType.Info
  const pending: boolean = pendingMessages?.[representativeMessage.id] !== undefined

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          paddingBottom: 30,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingRight: 15,
          }}
        >
          {info ? (
            <Image
              resizeMode='cover'
              resizeMethod='resize'
              source={appImages.quiet_icon}
              style={{ width: 37, height: 37 }}
            />
          ) : (
            <Jdenticon value={representativeMessage.nickname} size={37} />
          )}
        </View>
        <View style={{ flex: 8 }}>
          <View style={{ flexDirection: 'row', paddingBottom: 3 }}>
            <View style={{ alignSelf: 'flex-start' }}>
              <Typography fontSize={16} fontWeight={'medium'} color={pending ? 'lightGray' : 'main'}>
                {info ? 'Quiet' : representativeMessage.nickname}
              </Typography>
            </View>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingTop: 2,
                paddingLeft: 8,
              }}
            >
              <Typography fontSize={14} color={'subtitle'}>
                {representativeMessage.date}
              </Typography>
            </View>
          </View>
          <View style={{ flexShrink: 1 }}>
            {data.map((message: DisplayableMessage, index: number) => {
              const outerDivStyle = index > 0 ? classes.nextMessage : classes.firstMessage
              return (
                <View style={outerDivStyle} key={index}>
                  {renderMessage(message, pending)}
                </View>
              )
            })}
          </View>
        </View>
      </View>
    </View>
  )
}

const classes = StyleSheet.create({
  firstMessage: {
    paddingTop: 0,
  },
  nextMessage: {
    paddingTop: 4,
  },
})
