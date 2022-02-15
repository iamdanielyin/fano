import React, { useState, useEffect, useMemo, useImperativeHandle, forwardRef } from 'react'
import _ from 'lodash'
import { Select } from 'antd'
import { get, withLocale } from 'kuu-tools'
import classNames from 'classnames'
import { keywordSearchWrapper } from '../utils/tools'

function FanoSelect (props, ref) {
  useImperativeHandle(ref, () => ({}))
  useEffect(() => {
    const url = _.get(props, 'config.props.url')
    if (url) {
      fetchOptions(url)
    }
  }, [_.get(props, 'config.props.url')])
  const configProps = useMemo(() => _.cloneDeep(_.get(props, 'config.props', {})), [_.get(props, 'config.props')])
  const [options, setOptions] = useState(_.cloneDeep(_.get(props, 'config.props.options') || []))
  const fetchOptions = (url) => {
    if (!url) {
      return
    }
    get(url).then(json => {
      let options
      const afterFetch = _.get(props, 'config.props.afterFetch')
      if (_.isFunction(afterFetch)) {
        options = afterFetch(json)
      } else {
        options = _.get(json, 'list', json)
      }

      options = Array.isArray(options) ? options : []
      setOptions(options)
    }).catch(error => {
      console.error(`fetch options from '${url}' error: ${error}`)
    })
  }
  const onRemoteSearch = (keyword) => {
    const url = keywordSearchWrapper(keyword, props.config)
    fetchOptions(url)
  }

  const onChange = (e) => {
    const value = _.has(e, 'target') ? e.target.value : e
    if (_.isFunction(props.emit)) {
      props.emit(`${props.path}:change`, value)
    }
    if (_.isFunction(props.onChange)) {
      props.onChange(value)
    }
  }

  const renderOptions = (options) => {
    const result = []
    for (let i = 0; i < options.length; i++) {
      const item = options[i]
      if (item instanceof Select.OptGroup || item instanceof Select.Option) {
        continue
      }
      let label = item[_.get(configProps, 'labelKey', 'label')]
      if (_.isFunction(configProps.labelRender)) {
        label = configProps.labelRender(label, item, options)
      }
      const value = item[_.get(configProps, 'valueKey', 'value')]
      const children = item[_.get(configProps, 'childrenKey', 'children')]
      if (_.isArray(children)) {
        result.push(
          <Select.OptGroup label={label} key={item.key || value || label}>
            {renderOptions(children)}
          </Select.OptGroup>
        )
      } else {
        result.push(<Select.Option value={value} key={item.key || value}>{label}</Select.Option>)
      }
    }
    return result
  }

  const optionsChildren = useMemo(() => renderOptions(options), [options])
  const defaultProps = {
    placeholder: props.L('fano_placeholder_choose', 'Please choose {{name}}', { name: _.get(props.config, 'label') }),
    onClick: () => {
      fetchOptions(_.get(props, 'config.props.url'))
    }
  }
  configProps.className = classNames('fano-select', configProps.className)
  configProps.children = optionsChildren
  configProps.value = props.value
  configProps.onChange = onChange

  if (_.has(configProps, 'url') && _.get(configProps, 'remoteSearch', false)) {
    configProps.onRemoteSearch = onRemoteSearch
  }
  return <Select {...defaultProps} {..._.omit(configProps, ['fieldOptions'])} />
}

export default withLocale(forwardRef(FanoSelect))
