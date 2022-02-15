import React, { useEffect, useRef } from 'react'
import _ from 'lodash'
import JSONEditor from 'jsoneditor'
import 'jsoneditor/dist/jsoneditor.css'

let jsonEditor

function FanoJSON (props) {
  const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
  const options = _.omit(configProps, ['className', 'style', 'layout'])
  if (!options.mode) {
    options.mode = 'code'
  }
  if (!options.modes) {
    options.modes = ['code', 'form', 'tree', 'view']
  }
  options.onBlur = () => {
    let value = jsonEditor.getText()
    if (_.get(configProps, 'objectValue', false)) {
      try {
        value = JSON.parse(value || '{}')
      } catch (e) {
        return
      }
    }
    if (_.isFunction(props.emit)) {
      props.emit(`${props.path}:change`, value)
    }
    if (_.isFunction(props.onChange)) {
      props.onChange(value)
    }
  }
  const container = useRef(null)
  useEffect(() => {
    if (!jsonEditor) {
      jsonEditor = new JSONEditor(container.current, options)
    }
    if (_.get(configProps, 'objectValue', false)) {
      if (_.isPlainObject(props.value)) {
        jsonEditor.set(props.value)
      }
    } else {
      try {
        const value = JSON.parse(props.value)
        jsonEditor.set(value)
      } catch (e) {}
    }
    return () => {
      if (jsonEditor) {
        jsonEditor.destroy()
        jsonEditor = undefined
      }
    }
  }, [])

  const containerProps = _.pick(configProps, ['className', 'style'])
  containerProps.className = containerProps.className
    ? `${containerProps} fano-json`
    : 'fano-json'
  containerProps.ref = container
  containerProps.style = containerProps.style || { height: 500 }
  return (
    <div {...containerProps} />
  )
}

export default FanoJSON
