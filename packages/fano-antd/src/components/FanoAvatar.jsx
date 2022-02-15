import React from 'react'
import _ from 'lodash'
import { Avatar } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoAvatar extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-avatar` : 'fano-avatar'
    if (props.value) {
      if (props.value.startsWith('http') || props.value.startsWith('/')) {
        configProps.src = props.value
      } else {
        configProps.icon = props.value
      }
    }
    return <Avatar {...configProps} />
  }
}

export default withLocale(FanoAvatar)
