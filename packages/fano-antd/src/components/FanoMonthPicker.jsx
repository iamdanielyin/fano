import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { DatePicker } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoMonthPicker extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    const defaultProps = {}
    configProps.className = configProps.className
      ? `${configProps.className} fano-monthpicker`
      : 'fano-monthpicker'
    if (moment.isMoment(props.value)) {
      configProps.value = props.value
    } else if (_.isFunction(configProps.formatValue)) {
      configProps.value = configProps.formatValue(props.value)
    } else if (_.isString(props.value)) {
      const format = _.get(configProps, 'format', 'YYYY-MM')
      configProps.value = moment(props.value, format)
    } else {
      configProps.value = undefined
    }
    configProps.onChange = (date, dateString) => {
      let value = dateString
      if (_.isFunction(configProps.parseValue)) {
        value = configProps.parseValue(date, dateString)
      }
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, value)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(value)
      }
    }
    return <DatePicker.MonthPicker {...defaultProps} {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoMonthPicker)
