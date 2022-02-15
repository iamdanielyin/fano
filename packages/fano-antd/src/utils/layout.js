import React from 'react'
import _ from 'lodash'
import { Row, Col, Form, Tooltip, Icon } from 'antd'

function wrapperFormItem (item, rootProps) {
  let component = item.component
  if (rootProps.form) {
    const fieldOptions = _.get(item, 'config.props.fieldOptions', {})
    if (item.config.type === 'editor' && !_.has(fieldOptions, 'validateTrigger')) {
      _.set(fieldOptions, 'validateTrigger', 'onBlur')
    }
    const formItemProps = _.get(item, 'config.props.formItemProps', {})
    formItemProps.label = item.config.label
    if (item.config.tooltip) {
      const commonStyle = { cursor: 'pointer' }
      const tooltipIcon = (
        <Icon type='question-circle' />
      )
      if (_.isString(item.config.tooltip)) {
        formItemProps.label = (
          <Tooltip title={item.config.tooltip}>
            {formItemProps.label} {tooltipIcon}
          </Tooltip>
        )
      } else if (_.isPlainObject(item.config.tooltip)) {
        formItemProps.label = (
          <Tooltip title={formItemProps.label} {...item.config.tooltip}>
            {formItemProps.label} {tooltipIcon}
          </Tooltip>
        )
      }
      formItemProps.label = <span style={commonStyle}>{formItemProps.label}</span>
    }
    formItemProps.key = item.path
    component = (
      <Form.Item {...formItemProps}>
        {rootProps.form.getFieldDecorator(item.path, fieldOptions)(component)}
      </Form.Item>
    )
  }
  return component
}

export function responsiveLayout (levelResult, layoutProps, rootProps) {
  const rowProps = _.get(layoutProps, 'rowProps', {})
  if (!rowProps.gutter) {
    rowProps.gutter = 24
  }
  const globalColProps = getColProps(layoutProps)
  const cols = []
  for (let i = 0; i < levelResult.length; i++) {
    const item = levelResult[i]
    let itemColProps = _.get(item, 'config.props.layout')
    if (_.isEmpty(itemColProps)) {
      itemColProps = globalColProps
    }
    const component = wrapperFormItem(item, rootProps)
    cols.push(<Col key={i} {...itemColProps}>{component}</Col>)
  }
  return (
    <div>
      <Row {...rowProps}>{cols}</Row>
    </div>
  )
}

function getColProps (raw) {
  return _.has(raw, 'colProps') ? _.get(raw, 'colProps', {}) : raw
}
