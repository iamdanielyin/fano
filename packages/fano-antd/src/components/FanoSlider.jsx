import React from 'react'
import _ from 'lodash'
import { Slider } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoSlider extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      tmpVal: undefined
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value !== this.props.value) {
      this.setState({ tmpVal: nextProps.value })
    }
  }

  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    configProps.className = configProps.className
      ? `${configProps.className} fano-slider`
      : 'fano-slider'
    configProps.value = this.state.tmpVal
    configProps.onChange = value => {
      this.setState({ tmpVal: value })
    }
    configProps.onAfterChange = value => {
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, value)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(value)
      }
    }
    return <Slider {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoSlider)
