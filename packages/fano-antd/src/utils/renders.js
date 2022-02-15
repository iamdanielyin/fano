import React from 'react'
import moment from 'moment'
import mime from 'mime'
import _ from 'lodash'
import { Checkbox, Icon, Rate, Slider, Switch, Tag, Modal } from 'antd'
import { copy } from '../utils/tools'

export function defaultRenderDate (text, record, format = 'YYYY-MM-DD') {
  if (moment.isMoment(text)) {
    return text.format(format)
  } else if (_.isString(text)) {
    return moment(text).format(format)
  }
}

export function defaultRenderFromNow (text, record, format) {
  if (moment.isMoment(text)) {
    return text.fromNow()
  } else if (_.isString(text)) {
    return text.includes('T') ? moment(text).fromNow() : moment(text, format).fromNow()
  }
}

export function defaultRenderFile (text, record) {
  const renderItem = (url, index) => {
    const commonStyle = {
      maxHeight: 500,
      maxWidth: 700,
      cursor: 'pointer'
    }
    const dotIndex = url.lastIndexOf('.')
    let extension
    if (dotIndex !== -1) {
      extension = url.substring(dotIndex + 1)
    }
    const mimeType = mime.getType(extension)
    let content
    if (mimeType) {
      if (mimeType.startsWith('video')) {
        const commonProps = { loop: true, src: url }
        // 视频
        content = (
          <div
            onClick={e => {
              e.stopPropagation()
              Modal.info({
                className: 'fano-rowrender-file-preview',
                maskClosable: true,
                content: <video {...commonProps} autoPlay controls style={commonStyle} />
              })
            }}
          >
            <video {...commonProps} muted />
          </div>
        )
      } else if (mimeType.startsWith('image')) {
        // 图片
        const onError = (e) => {
          e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABP0lEQVQ4T9WUv0oDQRCHv7kmjS+QzhewUVBIo5U2ce9ALLTzmiBooVjoC2gj2liYwmClYJVd0ijWgn+w8SHyAmlS5EY0EMO52UuRJlfdsL/5YGY/VpjwJxPmMeVArVbniaJFRJZ+V6P6Spa9Sav1OWpVI0dWY/ZAzoFSrrkLeiTOXfmgXqBWk1UifQxeWCZr0mo+5TP/gBrHcygvwEyBAR2Eilj7NZzzAQ9QLgYh24R6vV/WahAnf/3CoVh7GQYacweyNQjFBtK0XzYaYN1Qv96Lc9sFwPgB2BwLKNyKtTth4Hp8hnA81sjorjh3HQYmyQKZfgxC5TK02/1y+B+6ZL1K3km/NsacgJyGb1n3fS6GxE5BbjzQDpls+Bz8yQYfB02SWXqsEOkyqiVE3oHnvHvBHRbIXHg85c9X4XyewDdVqWsVIAlHhwAAAABJRU5ErkJggg=='
        }
        const commonProps = { src: url, title: url, onError: onError }
        content = (
          <img
            alt={url}
            {...commonProps}
            onClick={e => {
              e.stopPropagation()
              Modal.info({
                className: 'fano-rowrender-file-preview',
                maskClosable: true,
                content: <img alt={url} {...commonProps} style={commonStyle} />
              })
            }}
          />
        )
      }
    }
    if (!content) {
      content = <Icon type='file' />
    }
    return (
      <div className='fano-rowrender-attach' key={index}>
        <div className='fano-rowrender-file'>
          {content}
        </div>
      </div>
    )
  }
  const children = []
  if (_.isArray(text)) {
    for (const index in text) {
      const item = text[index]
      children.push(renderItem(item, index))
    }
  } else if (_.isString(text)) {
    children.push(renderItem(text, text))
  }
  return <div className='fano-rowrender-attachs'>{children}</div>
}

export function defaultRenderTags (text, record, colors) {
  const children = []
  if (_.isString(colors) && !_.isEmpty(colors)) {
    colors = JSON.parse(colors)
  }
  const renderItem = (item, index) => (
    <div className='fano-rowrender-tag' key={index}>
      <Tag color={_.get(colors, item)}>{item}</Tag>
    </div>
  )
  if (_.isArray(text)) {
    for (const index in text) {
      const item = text[index]
      children.push(renderItem(item, index))
    }
  } else if (_.isString(text)) {
    children.push(renderItem(text, text))
  }
  return <div className='fano-rowrender-tags'>{children}</div>
}

export function defaultRenderColor (text, record) {
  const children = []
  const renderItem = (item, index) => {
    return (
      <div
        className='fano-rowrender-color'
        key={index}
        style={{ backgroundColor: item }}
      />
    )
  }
  if (_.isArray(text)) {
    for (const index in text) {
      const item = text[index]
      children.push(renderItem(item, index))
    }
  } else if (_.isString(text)) {
    children.push(renderItem(text, text))
  }
  return <div className='fano-rowrender-colors'>{children}</div>
}

function parseRenderArgs (args) {
  const config = {}
  if (args !== '') {
    args = _.split(args, ',')
    for (const item of args) {
      const split = item.split(':')
      const key = split[0]
      if (split.length > 1) {
        const val = split[1]
        if (['true', 'false'].includes(val)) {
          config[key] = { true: true, false: false }[val]
        } else if (/\d/.test(val)) {
          if (val.includes('.')) {
            config[key] = parseFloat(val)
          } else {
            config[key] = parseInt(val)
          }
        } else {
          config[key] = val
        }
      } else {
        config[key] = true
      }
    }
  }
  return config
}

export function defaultRenderRate (text, record, args) {
  return (
    <div className='fano-rowrender-rate'>
      <Rate
        {..._.assign(
          {
            disabled: true,
            defaultValue: text,
            value: text
          },
          parseRenderArgs(args)
        )}
      />
    </div>
  )
}

export function defaultRenderSlider (text, record, args) {
  return (
    <div className='fano-rowrender-slider'>
      <Slider
        {..._.assign(
          {
            disabled: true,
            defaultValue: text,
            value: text
          },
          parseRenderArgs(args)
        )}
      />
    </div>
  )
}

export function defaultRenderSwitch (text, record, args) {
  return (
    <div className='fano-rowrender-switch'>
      <Switch
        {..._.assign(
          {
            defaultChecked: text,
            checked: text
          },
          parseRenderArgs(args)
        )}
      />
    </div>
  )
}

export function defaultRenderCheckbox (text, record, args) {
  return (
    <div className='fano-rowrender-checkbox'>
      <Checkbox
        {..._.assign(
          {
            defaultChecked: text,
            checked: text
          },
          parseRenderArgs(args)
        )}
      />
    </div>
  )
}

export function defaultRenderCopy (text) {
  return (
    <div className='fano-rowrender-copy'>
      {copy(text)}
    </div>
  )
}

export default {
  date: defaultRenderDate,
  fromNow: defaultRenderFromNow,
  image: defaultRenderFile,
  file: defaultRenderFile,
  tags: defaultRenderTags,
  color: defaultRenderColor,
  rate: defaultRenderRate,
  slider: defaultRenderSlider,
  switch: defaultRenderSwitch,
  checkbox: defaultRenderCheckbox,
  copy: defaultRenderCopy
}
