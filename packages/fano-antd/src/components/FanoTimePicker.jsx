import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { TimePicker } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoTimePicker extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    const defaultProps = {}
    configProps.className = configProps.className
      ? `${configProps.className} fano-timepicker`
      : 'fano-timepicker'
    if (moment.isMoment(props.value)) {
      configProps.value = props.value
    } else if (_.isFunction(configProps.formatValue)) {
      configProps.value = configProps.formatValue(props.value)
    } else if (_.isString(props.value)) {
      const format = _.get(configProps, 'format', 'HH:mm:ss')
      configProps.value = moment(props.value, format)
    } else {
      configProps.value = undefined
    }
    configProps.onChange = (time, timeString) => {
      let value = timeString
      if (_.isFunction(configProps.parseValue)) {
        value = configProps.parseValue(time, timeString)
      }
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, value)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(value)
      }
    }
    return <TimePicker {...defaultProps} {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoTimePicker)
