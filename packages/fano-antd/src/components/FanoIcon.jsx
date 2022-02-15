import React, { useState, useMemo, useImperativeHandle, forwardRef } from 'react'
import _ from 'lodash'
import iconManifest from '@ant-design/icons/lib/manifest'
import { Popover, Icon, Input, Tooltip, Radio } from 'antd'
import { parseIcon, withLocale } from 'kuu-tools'

function FanoIcon (props, ref) {
  const [visible, setVisible] = useState(false)
  const [keywordValue, setKeywordValue] = useState('')
  const [themeValue, setThemeValue] = useState('outlined')
  useImperativeHandle(ref, () => ({}))
  const IconList = useMemo(() => {
    const arr = []
    const exists = {}
    // 添加系统图标
    const configProps = _.get(props, 'config.props', {})
    if (_.get(configProps, 'antd', true)) {
      const themeKeyMap = {
        fill: 'filled',
        outline: 'outlined',
        twotone: 'twoTone'
      }
      const depracated = {
        interation: 'interaction',
        'colum-height': 'column-height',
        canlendar: 'calendar'
      }
      for (const key in iconManifest) {
        const theme = themeKeyMap[key]
        if (themeValue && !theme.includes(themeValue)) {
          continue
        }
        const list = iconManifest[key]
        for (const item of list) {
          const type = depracated[item] ? depracated[item] : item
          if (keywordValue && !type.includes(keywordValue)) {
            continue
          }
          const value = `${theme}:${type}`
          if (exists[value]) {
            continue
          }
          exists[value] = true
          arr.push(
            <Tooltip title={value} key={value}>
              <Icon
                key={value}
                theme={theme}
                type={type}
                style={{ margin: 3, cursor: 'pointer', fontSize: 20 }}
                onClick={() => {
                  onChange(value)
                }}
              />
            </Tooltip>
          )
        }
      }
    }
    return arr
  }, [keywordValue, themeValue])
  const onChange = (value) => {
    if (_.isFunction(props.emit)) {
      props.emit(`${props.path}:change`, value)
    }
    if (_.isFunction(props.onChange)) {
      props.onChange(value)
    }
    setVisible(false)
  }

  const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
  configProps.className = configProps.className ? `${configProps.className} fano-icon` : 'fano-icon'

  configProps.trigger = 'click'
  configProps.placement = 'bottomLeft'
  configProps.visible = visible
  configProps.overlayClassName = 'fano-icon-overlay'
  configProps.onVisibleChange = visible => {
    setVisible(visible)
  }
  configProps.content = (
    <div className='fano-icon-container'>
      <div className='fano-icon-theme'>
        <Radio.Group value={themeValue} onChange={e => setThemeValue(e.target.value)}>
          <Radio.Button value='outlined'>{props.L('fano_icon_theme_outlined', 'Outlined')}</Radio.Button>
          <Radio.Button value='filled'>{props.L('fano_icon_theme_filled', 'Filled')}</Radio.Button>
          <Radio.Button value='twoTone'>{props.L('fano_icon_theme_twotone', 'Two Tone')}</Radio.Button>
        </Radio.Group>
      </div>
      <div className='fano-icon-keyword'>
        <Input
          allowClear
          placeholder={props.L('fano_icon_search_placeholder', 'Search icons here')}
          onChange={e => setKeywordValue(e.target.value)}
        />
      </div>
      <div className='fano-icon-list'>
        {IconList}
      </div>
    </div>
  )
  const handleClear = (e) => {
    e.stopPropagation()
    onChange('')
  }
  configProps.children = (
    <div className='fano-icon-value'>
      {
        props.value ? (
          <Tooltip title={props.value}>
            <Icon {...parseIcon(props.value)} className='fano-icon-value-icon' />
          </Tooltip>
        ) : (
          <span className='fano-icon-value-placeholder'>
            {props.L('fano_icon_choose', 'Choose Icon')}
          </span>
        )
      }
      {props.value && <Icon className='fano-icon-value-clear' onClick={handleClear} type='close-circle' />}
    </div>
  )
  return <Popover {...configProps} />
}

export default withLocale(forwardRef(FanoIcon))
