import React from 'react'
import _ from 'lodash'
import { Switch } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoSwitch extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-switch` : 'fano-switch'
    configProps.checked = props.value
    configProps.onChange = checked => {
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, checked)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(checked)
      }
    }
    return <Switch {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoSwitch)
