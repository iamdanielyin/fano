import React from 'react'
import _ from 'lodash'
import { List, Button } from 'antd'
import { withLocale } from 'kuu-tools'

class FanoGroup extends React.PureComponent {
  constructor (props) {
    super(props)
    this.handleAddClick = this.handleAddClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
  }

  handleAddClick () {
    let values = _.isArray(this.props.value) ? this.props.value : []
    values = this.addValue(values)
    this.onChange([...values])
  }

  addValue (values) {
    const configProps = _.get(this.props, 'config.props', {})
    const { onAdd, defaultValue } = configProps
    if (_.isFunction(onAdd)) {
      const ret = onAdd(values)
      if (ret !== undefined) {
        values = ret
      }
    } else {
      values.push(defaultValue)
    }
    return values
  }

  handleRemoveClick (item, index) {
    const configProps = _.get(this.props, 'config.props', {})
    const { onRemove } = configProps
    let values = _.isArray(this.props.value) ? this.props.value : []
    if (_.isFunction(onRemove)) {
      const ret = onRemove(values, index)
      if (ret !== undefined) {
        values = ret
      }
    } else {
      values.splice(index, 1)
    }
    this.onChange([...values])
  }

  onChange (value) {
    if (_.isFunction(this.props.emit)) {
      this.props.emit(`${this.props.path}:change`, value)
    }
    if (_.isFunction(this.props.onChange)) {
      this.props.onChange(value)
    }
  }

  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    const defaultProps = {
      size: 'small'
    }
    const { renderItem, customActions } = configProps
    configProps.dataSource = props.value
    configProps.renderItem = (item, index) => {
      let actions = [
        <Button
          className='fano-group-action fano-group-action-danger'
          key='minus'
          icon='minus'
          size='small'
          type='danger'
          shape='circle'
          onClick={() => {
            this.handleRemoveClick(item, index)
          }}
        />
      ]
      if (_.isFunction(customActions)) {
        actions = customActions(item, index)
      }
      return (
        <List.Item
          actions={actions}
        >
          {renderItem(item, newItem => {
            const { value } = props
            _.set(value, `[${index}]`, newItem)
            this.onChange([...value])
          }, index, props)}
        </List.Item>
      )
    }
    return (
      <div className={configProps.className ? `${configProps.className} fano-group` : 'fano-group'}>
        {
          !_.isEmpty(configProps.dataSource) &&
            <List {...defaultProps} {..._.omit(configProps, ['onAdd', 'onRemove', 'defaultValue', 'addText', 'fieldOptions', 'layout'])} />
        }
        {
          _.get(configProps, 'allowAdd', true) &&
            <Button
              key='plus'
              size='small'
              type='link'
              icon='plus-circle'
              onClick={this.handleAddClick}
            >
              {configProps.addText || this.props.L('fano_group_add_item', 'Add Item')}
            </Button>
        }
      </div>
    )
  }
}

export default withLocale(FanoGroup)
