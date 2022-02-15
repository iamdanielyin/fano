import React from 'react'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import { Tree, Input } from 'antd'
import { get, withLocale } from 'kuu-tools'
import { keywordSearchWrapper } from '../utils/tools'

class FanoTree extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
    this.onChange = this.onChange.bind(this)
    this.onRemoteSearch = this.onRemoteSearch.bind(this)
    this.fetchTreeData = this.fetchTreeData.bind(this)
  }

  componentDidMount () {
    const url = _.get(this.props, 'config.props.url')
    if (url) {
      this.fetchTreeData(url)
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

  renderTreeNodes (nodes) {
    const configProps = _.get(this.props, 'config.props', {})
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i]
      if (item instanceof Tree.TreeNode) {
        continue
      }
      let title = item[_.get(configProps, 'titleKey', 'title')]
      if (_.isFunction(configProps.titleRender)) {
        title = configProps.titleRender(title, item, nodes)
      }
      item.title = title
      item.key = item[_.get(configProps, 'keyName', 'key')] || item[_.get(configProps, 'valueKey', 'value')]
      const childrenKey = _.get(
        this.getArrayToTreeOpts(),
        'childrenProperty',
        'children'
      )
      const children = item[childrenKey]
      if (children) {
        nodes[i] = (
          <Tree.TreeNode {..._.omit(item, childrenKey)}>
            {this.renderTreeNodes(item[childrenKey])}
          </Tree.TreeNode>
        )
      } else {
        nodes[i] = <Tree.TreeNode {...item} />
      }
    }
    return nodes
  }

  async fetchTreeData (url) {
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
      console.error(`fetch tree data from '${url}' error: ${error}`)
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

  onRemoteSearch (e) {
    const url = keywordSearchWrapper(e.target.value, this.props.config)
    this.fetchTreeData(url)
  }

  render () {
    const configProps = _.cloneDeep(_.get(this.props, 'config.props', {}))
    const defaultProps = {
      placeholder: this.props.L('fano_placeholder_choose', 'Please choose {{name}}', { name: _.get(this.props.config, 'label') })
    }
    const searchProps = _.get(configProps, 'search', {})
    const treeProps = _.omit(configProps, 'search')

    treeProps.children = _.has(treeProps, 'treeData')
      ? treeProps.treeData
      : this.state.treeData
    treeProps.children = _.isArray(treeProps.children) ? treeProps.children : []
    treeProps.children = this.renderTreeNodes(_.cloneDeep(treeProps.children))

    treeProps.value = this.props.value
    treeProps.showLine = _.get(configProps, 'showLine', true)
    treeProps.onChange = this.onChange

    if (_.has(treeProps, 'url') && _.get(treeProps, 'remoteSearch', false)) {
      searchProps.onChange = this.onRemoteSearch
    }
    searchProps.className = searchProps.className
      ? `${searchProps.className} fano-tree-search`
      : 'fano-tree-search'
    return (
      <div className='fano-tree'>
        <Input.Search {...searchProps} />
        <Tree {...defaultProps} {...treeProps} />
      </div>
    )
  }
}

export default withLocale(FanoTree)
