import React from 'react'
import _ from 'lodash'
import { Tag } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoTags extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    const tags = _.isArray(props.value) ? props.value : []
    if (configProps.checkable) {
      return (
        <div>
          {tags.map((item, index) => {
            const checkedKey = _.get(configProps, 'checkedKey', 'checked')
            const labelKey = _.get(configProps, 'labelKey', 'label')
            configProps.checked = !!item[checkedKey]
            configProps.children = item[labelKey]
            configProps.onChange = checked => {
              const value = _.clone(tags)
              _.set(value, `[${index}].${checkedKey}`, checked)
              if (_.isFunction(props.emit)) {
                props.emit(`${props.path}:change`, value)
              }
              props.onChange(value)
            }
            return <Tag.CheckableTag key={index} {...(_.omit(configProps, 'checkable'))} />
          })}
        </div>
      )
    } else {
      return (
        <div className='fano-tags'>
          {tags.map(item => {
            const labelKey = _.get(configProps, 'labelKey', 'label')
            const valueKey = _.get(configProps, 'valueKey', 'value')
            const key = _.isPlainObject(item) ? item[valueKey] || item[labelKey] : item
            configProps.children = _.isPlainObject(item) ? item[labelKey] : item
            if (configProps.closable) {
              configProps.onClose = removedTag => {
                const value = tags.filter(item => _.isPlainObject(item) ? (item[valueKey] !== removedTag) : (item !== removedTag))
                if (_.isFunction(props.emit)) {
                  props.emit(`${props.path}:change`, value)
                }
                if (_.isFunction(props.onChange)) {
                  props.onChange(value)
                }
              }
            }
            return <Tag key={key} {...configProps} />
          })}
        </div>
      )
    }
  }
}

export default withLocale(FanoTags)
