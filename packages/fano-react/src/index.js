import React from 'react'
import _ from 'lodash'
import mitt from 'mitt'

const defaultEmitter = mitt()

function convertBoolStrings (v) {
  if (_.isString(v) && /^(true|false)+$/i.test(v)) {
    v = v.toLowerCase()
    return {
      true: true,
      false: false
    }[v]
  }
  return v
}

function renderContainer (container = [], value = {}, options = {}) {
  container = Array.isArray(container) ? container : [container]
  const levelResult = []
  let result = []

  for (const item of container) {
    const each = _.cloneDeep(item)
    const path = options.path ? `${options.path}.${each.name}` : each.name
    each.props = each.props || {}
    each.transparent = !!each.container
    // 获取组件
    const EachComponent = options.rootProps.types[each.type]
    const eachValue = value[each.name]
    const context = {
      rootValue: options.rootProps.value,
      rootConfig: options.rootProps.config,
      parentConfig: options.config,
      parentPath: options.path,
      parentValue: value,
      currentPath: path,
      currentConfig: each,
      currentValue: eachValue,
      _
    }
    if (each.condition) {
      const compiled = _.template(each.condition)
      const cond = compiled(context)
      if (!convertBoolStrings(cond)) {
        continue
      }
    }

    // 处理each.props
    for (const key in each.props) {
      const value = each.props[key]
      if (_.isString(value) && /\{\{.+\}\}/.test(value)) {
        const compiled = _.template(value)
        const result = compiled(context)
        if (/^(true|false)+$/i.test(result)) {
          each.props[key] = convertBoolStrings(result)
        } else if (/^\d+\.\d$/.test(result)) {
          each.props[key] = window.parseFloat(result)
        } else if (/^\d+$/.test(result)) {
          each.props[key] = window.parseInt(result)
        } else {
          each.props[key] = result
        }
      }
    }
    // value有三种类型：简单值、对象、数组
    if (each.props.repeat && Array.isArray(eachValue)) {
      // 这里只需针对数组进行处理
      for (let i = 0; i < eachValue.length; i++) {
        const k = each.transparent ? `[${i}]` : `${each.name}[${i}]`
        const v = each.transparent ? value : _.get(value, k)
        const instance = renderComponent({
          config: each,
          key: k,
          value: v,
          component: EachComponent,
          parentValue: value,
          options
        })
        result.push(instance)
        levelResult.push({
          path: options.path ? `${options.path}.${k}` : k,
          name: `${each.name}[${i}]`,
          Component: instance,
          config: each
        })
      }
    } else {
      // 其余情况只需原样传递即可
      const k = each.transparent ? '' : each.name
      const v = each.transparent ? value : _.get(value, k)
      const instance = renderComponent({
        config: each,
        key: k,
        value: v,
        Component: EachComponent,
        parentValue: value,
        options
      })
      result.push(instance)
      levelResult.push({
        path: options.path ? `${options.path}.${k}` : k,
        name: each.name,
        component: instance,
        config: each
      })
    }
  }

  if (_.isFunction(options.rootProps.layout)) {
    const layoutProps = _.get(options, 'config.props.layout')
    result = options.rootProps.layout(levelResult, layoutProps)
  } else if (_.isPlainObject(options.rootProps.layout)) {
    const layoutHandler = options.rootProps.layout.handler
    const layoutProps =
      _.get(options, 'config.props.layout') ||
      _.omit(options.rootProps.layout, 'handler')
    if (_.isFunction(layoutHandler)) {
      result = layoutHandler(levelResult, layoutProps, options.rootProps)
    }
  }
  return result
}

function renderComponent (args) {
  const {
    config,
    key,
    value,
    Component,
    parentValue,
    options
  } = args
  const emitter = options.rootProps.emitter || defaultEmitter
  const props = {
    emitter: emitter,
    on: emitter.on,
    emit: emitter.emit,
    off: emitter.off,
    path: options.path ? `${options.path}.${key}` : key,
    key,
    value,
    config,
    onChange: (newValue, changePath) => {
      if (key) {
        _.set(parentValue, key, newValue)
      } else {
        _.merge(parentValue, newValue)
      }
      options.onChange(parentValue, changePath || props.path)
    },
    rootProps: options.rootProps
  }
  if (config.container) {
    props.children = renderContainer(
      options.rootProps,
      config.container,
      config,
      value,
      {
        onChange: (newValue, changePath) => {
          if (key) {
            _.set(parentValue, key, newValue)
          } else {
            _.merge(parentValue, newValue)
          }
          options.onChange(parentValue, changePath || props.path)
        },
        config,
        path: props.path,
        rootProps: options.rootProps
      }
    )
  }
  if (options.rootProps.form) {
    delete props.value
    delete props.onChange
  }
  return <Component {...props} />
}

function setDisabled (config, disabled) {
  if (_.isArray(config)) {
    for (const index in config) {
      setDisabled(config[index], disabled)
    }
  } else {
    _.set(config, 'props.disabled', disabled)
  }
}

export default props => {
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g
  const disabled = _.isBoolean(props.disabled) ? props.disabled : false
  let config = props.config
  if (disabled === true) {
    config = _.cloneDeep(config)
    setDisabled(config, disabled)
  }
  return (
    <div
      style={props.style}
      className={props.className ? `${props.className} fano` : 'fano'}
    >
      {renderContainer(config, props.value, {
        onChange: (value, path) => {
          if (_.isFunction(props.onChange)) {
            props.onChange(value, path)
          }
        },
        config,
        rootProps: props
      })}
    </div>
  )
}
