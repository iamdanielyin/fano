import React from 'react'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import { TreeSelect } from 'antd'
import { get, withLocale } from 'kuu-tools'

class FanoTreeSelect extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.onChange = this.onChange.bind(this)
    this.fetchOptions = this.fetchOptions.bind(this)
  }

  componentDidMount () {
    const url = _.get(this.props, 'config.props.url')
    if (url) {
      this.fetchOptions(url)
    }
  }

  getArrayToTreeOpts () {
    const defaultOpts = {
      customID: 'ID',
      parentProperty: 'Pid',
      childrenProperty: 'children'
    }
    const customOpts = _.get(this.props, 'config.props.arrayToTree', false)
    if (_.isPlainObject(customOpts)) {
      _.assign(defaultOpts, customOpts)
    }
    return defaultOpts
  }

  renderTreeData (treeData, configProps) {
    const result = []
    for (let i = 0; i < treeData.length; i++) {
      const item = treeData[i]
      let title = item[_.get(configProps, 'titleKey', 'title')]
      if (_.isFunction(configProps.titleRender)) {
        title = configProps.titleRender(title, item, treeData)
      }
      const value = item[_.get(configProps, 'valueKey', 'value')]
      const key = item[_.get(configProps, 'keyName', 'key')] || value
      const rawChildren = item[_.get(configProps, 'childrenKey', 'children')]

      const data = { ...item, title, value, key }
      if (_.isArray(rawChildren) && !_.isEmpty(rawChildren)) {
        data.children = this.renderTreeData(rawChildren, configProps)
      }
      result.push(data)
    }
    return result
  }

  async fetchOptions (url) {
    if (!url) {
      return
    }
    try {
      const json = await get(url)

      let treeData
      const afterFetch = _.get(this.props, 'config.props.afterFetch')
      if (_.isFunction(afterFetch)) {
        treeData = afterFetch(json)
      } else {
        treeData = _.get(json, 'list', json)
        const needArrayToTree = _.get(
          this.props,
          'config.props.arrayToTree',
          true
        )
        if (needArrayToTree) {
          treeData = arrayToTree(treeData, this.getArrayToTreeOpts())
        }
      }

      treeData = Array.isArray(treeData) ? treeData : []
      this.setState({ treeData })
    } catch (error) {
      console.error(`fetch treeData from '${url}' error: ${error}`)
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
    const defaultProps = {
      allowClear: true,
      showSearch: true,
      treeDefaultExpandAll: false,
      placeholder: this.props.L('fano_placeholder_choose', 'Please choose {{name}}', { name: _.get(this.props.config, 'label') }),
      treeNodeFilterProp: _.get(configProps, 'titleKey', 'title'),
      searchPlaceholder: this.props.L('fano_placeholder_keyword', 'Please enter a keyword'),
      onClick: () => {
        this.fetchOptions(_.get(this.props, 'config.props.url'))
      }
    }
    configProps.className = configProps.className
      ? `${configProps.className} fano-tree-select`
      : 'fano-tree-select'
    configProps.treeData = _.has(configProps, 'treeData')
      ? configProps.treeData
      : this.state.treeData
    configProps.treeData = _.isArray(configProps.treeData)
      ? configProps.treeData
      : []
    configProps.treeData = this.renderTreeData(configProps.treeData, configProps)
    if (this.props.value) {
      configProps.value = this.props.value
    }
    configProps.onChange = this.onChange
    return <TreeSelect {...defaultProps} {...configProps} />
  }
}

export default withLocale(FanoTreeSelect)
