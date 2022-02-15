import React from 'react'
import _ from 'lodash'
import { Progress } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoProgress extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-progress` : 'fano-progress'
    configProps.percent = props.value
    return <Progress {...configProps} />
  }
}

export default withLocale(FanoProgress)
