import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { DatePicker } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoRangePicker extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    const defaultProps = {}
    configProps.className = configProps.className
      ? `${configProps.className} fano-rangepicker`
      : 'fano-rangepicker'
    const value = _.compact(props.value)
    if (_.isEmpty(value)) {
      configProps.value = undefined
    } else {
      if (_.isFunction(configProps.formatValue)) {
        configProps.value = configProps.formatValue(value)
      } else {
        const format = _.get(configProps, 'format', 'YYYY-MM-DD HH:mm:ss')
        configProps.value = _.clone(value)
        for (let i = 0; i < configProps.value.length; i++) {
          if (moment.isMoment(configProps.value[i])) {
            continue
          } else if (_.isString(configProps.value[i])) {
            configProps.value[i] = moment(configProps.value[i], format)
          }
        }
      }
    }
    configProps.onChange = (dates, dateStrings) => {
      let value = dateStrings
      if (_.isFunction(configProps.parseValue)) {
        value = configProps.parseValue(dates, dateStrings)
      }
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, value)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(value)
      }
    }
    return <DatePicker.RangePicker {...defaultProps} {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoRangePicker)
