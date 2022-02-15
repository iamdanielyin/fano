import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { Button, Col, Form, Row } from 'antd'
import _ from 'lodash'
import Fano from 'fano-react'
import { responsiveLayout } from './utils/layout'
import { types } from './index'
import { withLocale } from 'kuu-tools'

function renderFanoWrapper (props, useForm = false) {
  const formProps = _.omit(props, [
    'config',
    'value',
    'onChange',
    'form',
    'formLayout',
    'fields',
    'onFieldsChange',
    'onValuesChange',
    'submitText',
    'onCancel',
    'cancelText',
    'bottomClassName',
    'changedValues',
    'localeMessages',
    'L',
    'disabled',
    'bottom',
    'renderBottom'
  ])
  formProps.layout = props.formLayout || 'horizontal'
  const [submitLoading, setSubmitLoading] = useState(false)
  const defaultLayout = {
    handler: responsiveLayout,
    xs: 24,
    sm: 24,
    md: 12,
    lg: 8,
    xl: 8,
    xxl: 6
  }
  const fanoProps = _.clone(props)
  fanoProps.types = fanoProps.types ? _.merge(types, fanoProps.types) : types
  fanoProps.layout = fanoProps.layout
    ? _.merge(defaultLayout, fanoProps.layout)
    : defaultLayout

  if (useForm) {
    let bottom
    if (_.has(props, 'bottom')) {
      bottom = props.bottom
    } else {
      if (_.isFunction(props.renderBottom)) {
        bottom = props.renderBottom({ ...props, loading: submitLoading })
      } else {
        bottom = (
          <div className={props.bottomClassName}>
            <Row justify='end'>
              <Col span={24} style={{ textAlign: 'right', marginBottom: 15 }}>
                <Button
                  type='primary' htmlType='submit' disabled={_.isEmpty(props.changedValues)} loading={submitLoading}
                >
                  {props.submitText || props.L('fano_form_btnsubmit', 'Submit')}
                </Button>
                <Button style={{ marginLeft: 8 }} onClick={props.onCancel}>
                  {props.cancelText || props.L('fano_form_btncancel', 'Cancel')}
                </Button>
              </Col>
            </Row>
          </div>
        )
      }
      formProps.onSubmit = e => {
        e.preventDefault()
        if (submitLoading) {
          return
        }
        setSubmitLoading(true)
        if (_.isFunction(props.onSubmit)) {
          props.form.validateFieldsAndScroll(async (err, values) => {
            if (err) {
              setSubmitLoading(false)
              return
            }
            let ret = await props.onSubmit(err, values)
            if (!_.isBoolean(ret)) {
              ret = false
            }
            setSubmitLoading(ret)
          })
        }
      }
    }
    if (fanoProps.disabled === true) {
      bottom = undefined
    }
    return (
      <div className='fano-form'>
        <Form {...formProps}>
          <Fano {...fanoProps} />
          <div className='fano-form-bottom'>
            {bottom}
          </div>
        </Form>
      </div>
    )
  }
  return <Fano {...fanoProps} />
}

const FanoForm = Form.create({
  onFieldsChange (props, changedFields) {
    props.onFieldsChange(changedFields)
  },
  mapPropsToFields (props) {
    const { fields, config } = props
    const result = {}
    for (const item of config) {
      let value = _.get(props.value, item.name)
      if (_.isFunction(item.formatter)) {
        value = item.formatter(value)
      }
      result[item.name] = Form.createFormField({
        ..._.get(fields, item.name),
        value
      })
    }
    return result
  },
  onValuesChange (props, changedValues, allValues) {
    props.onValuesChange(changedValues, { ...props.value, ...allValues })
  }
})(withLocale(props => renderFanoWrapper(props, true)))

// 无表单
export const FanoWrapper = withLocale(props => renderFanoWrapper(props))

// 有表单
function FanoFormComponent (props, ref) {
  // 订阅配置
  const [configMap, setConfigMap] = useState({})
  useEffect(() => {
    const newConfigMap = _.chain(props.config)
      .groupBy('name')
      .mapValues(values => _.head(values))
      .value()
    setConfigMap(newConfigMap)
  }, [props.config])

  const [fields, setFields] = useState(undefined)
  const [changedValues, setChangedValues] = useState(undefined)
  const handleFieldsChange = (changedFields) => {
    const allFields = { ...fields, ...changedFields }
    if (_.isFunction(props.onFieldsChange)) {
      props.onFieldsChange(changedFields, allFields)
    }
    setFields(allFields)
  }

  const handleValuesChange = (currentChangedValues, allValues) => {
    handleParser(changedValues, allValues)
    const newChangedValues = { ...changedValues || {}, ...currentChangedValues }
    if (_.isFunction(props.onValuesChange)) {
      props.onValuesChange(currentChangedValues, allValues)
    }
    if (_.isFunction(props.onChange)) {
      props.onChange(newChangedValues, allValues)
    }
    setChangedValues(newChangedValues)
  }

  const handleParser = (changedValues, allValues) => {
    if (!_.isEmpty(configMap)) {
      const changedKey = _.get(_.keys(changedValues), '[0]')
      const changedValue = _.get(changedValues, changedKey)
      const parser = _.get(configMap, `${changedKey}.parser`)
      if (changedKey && _.isFunction(parser)) {
        const parsedValue = parser(changedValue)
        // antd form 表单默认会将包含.的字段转换成多级值
        _.set(changedValues, changedKey, parsedValue)
        _.set(allValues, changedKey, parsedValue)
      }
    }
  }

  const getFieldsValue = (fieldNames) => {
    return _.isEmpty(fieldNames) ? props.value : _.pick(props.value, fieldNames)
  }

  const setFieldsValue = (newValues, all = false) => {
    const newChangedValues = all ? newValues : { ...changedValues || {}, ...newValues }
    const newAllValues = all ? newValues : { ...props.value, ...newValues }
    setChangedValues(newChangedValues)
    const newFields = _.cloneDeep(fields)
    for (const key in newValues) {
      const value = newValues[key]
      _.set(newFields, `${key}.name`, key)
      _.set(newFields, `${key}.value`, value)
    }
    setFields(newFields)
    if (_.isFunction(props.onChange)) {
      props.onChange(newChangedValues, newAllValues)
    }
  }
  const reset = (callback) => {
    setChangedValues(undefined)
    setFields(undefined)
    if (_.isFunction(callback)) {
      callback()
    }
  }
  useImperativeHandle(ref, () => ({
    getFieldsValue,
    setFieldsValue,
    reset
  }))

  return (
    <FanoForm
      {...props}
      fields={fields}
      value={props.value}
      changedValues={changedValues}
      onFieldsChange={handleFieldsChange}
      onValuesChange={handleValuesChange}
    />
  )
}

export default forwardRef(FanoFormComponent)
