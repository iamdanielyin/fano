import React from 'react'
import _ from 'lodash'
import { Checkbox } from 'antd'
import { withLocale, get } from 'kuu-tools'

class FanoCheckbox extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.onChange = this.onChange.bind(this)
  }

  componentDidMount () {
    const url = _.get(this.props, 'config.props.url')
    if (url) {
      this.fetchOptions(url)
    }
  }

  async fetchOptions (url) {
    try {
      const json = await get(url)

      let options
      const afterFetch = _.get(this.props, 'config.props.afterFetch')
      if (_.isFunction(afterFetch)) {
        options = afterFetch(json)
      } else {
        options = _.get(json, 'list', json)
      }

      options = Array.isArray(options) ? options : []
      this.setState({ options })
    } catch (error) {
      console.error(`fetch options from '${url}' error: ${error}`)
    }
  }

  componentWillUnmount () {
    this.setState = () => {}
  }

  onChange (e) {
    const value = _.has(e, 'target') ? e.target.value : e
    if (_.isFunction(this.props.emit)) {
      this.props.emit(`${this.props.path}:change`, value)
    }
    if (_.isFunction(this.props.onChange)) {
      this.props.onChange(value)
    }
  }

  render () {
    const configProps = _.cloneDeep(_.get(this.props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-checkbox` : 'fano-checkbox'
    configProps.options = _.has(configProps, 'options') ? configProps.options : this.state.options
    configProps.options = _.isArray(configProps.options) ? configProps.options : []
    configProps.value = this.props.value
    configProps.onChange = this.onChange
    return <Checkbox.Group {..._.omit(configProps, ['fieldOptions'])} />
  }
}

export default withLocale(FanoCheckbox)
