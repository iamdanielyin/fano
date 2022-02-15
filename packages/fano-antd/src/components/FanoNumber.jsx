import React from 'react'
import _ from 'lodash'
import { InputNumber } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoNumber extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    const defaultProps = {
      placeholder: props.L('fano_placeholder_input', 'Please input {{name}}', { name: _.get(props.config, 'label') })
    }
    configProps.className = configProps.className ? `${configProps.className} fano-number` : 'fano-number'
    configProps.value = props.value
    configProps.onChange = e => {
      const value = _.has(e, 'target') ? e.target.value : e
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, value)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(value)
      }
    }
    return <InputNumber {...defaultProps} {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoNumber)
