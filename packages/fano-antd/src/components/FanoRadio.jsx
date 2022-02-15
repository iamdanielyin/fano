import React from 'react'
import _ from 'lodash'
import { Radio } from 'antd'
import { get, withLocale } from 'kuu-tools'

class FanoRadio extends React.Component {
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
    configProps.className = configProps.className ? `${configProps.className} fano-radio` : 'fano-radio'
    configProps.options = _.has(configProps, 'options') ? configProps.options : this.state.options
    configProps.options = _.isArray(configProps.options) ? configProps.options : []
    if (configProps.button) {
      for (let i = 0; i < configProps.options.length; i++) {
        const item = configProps.options[i]
        if (item instanceof Radio.Button) {
          continue
        }
        configProps.options[i] = <Radio.Button value={item.value}>{item.label}</Radio.Button>
      }
    }
    configProps.value = this.props.value
    configProps.onChange = this.onChange
    return <Radio.Group {...configProps} />
  }
}

export default withLocale(FanoRadio)
