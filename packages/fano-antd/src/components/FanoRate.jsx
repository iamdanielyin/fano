import React from 'react'
import _ from 'lodash'
import { Rate } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoRate extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-rate` : 'fano-rate'
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
    return <Rate {...configProps} />
  }
}

export default withLocale(FanoRate)
