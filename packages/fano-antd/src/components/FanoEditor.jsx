import React, { useEffect, useState, useMemo, useImperativeHandle, forwardRef } from 'react'
import _ from 'lodash'
import 'braft-editor/dist/index.css'
import BraftEditor from 'braft-editor'
import { withLocale } from 'kuu-tools'

function FanoEditor (props, ref) {
  const [editorState, setEditorState] = useState(null)

  useImperativeHandle(ref, () => ({}))
  useEffect(() => {
    setEditorState(BraftEditor.createEditorState(props.value))
  }, [props.value])

  const onChange = (editorState) => {
    setEditorState(editorState)
  }

  const onSave = () => {
    const value = editorState.toHTML()
    if (_.isFunction(props.emit)) {
      props.emit(`${props.path}:change`, value)
    }
    if (_.isFunction(props.onChange)) {
      props.onChange(value)
    }
  }
  const configProps = useMemo(() => {
    return _.cloneDeep(_.get(props, 'config.props', {}))
  }, [_.get(props, 'config.props', {})])
  const defaultProps = {}
  configProps.className = configProps.className
    ? `${configProps.className} fano-editor`
    : 'fano-editor'
  configProps.readOnly = configProps.disabled
  configProps.value = editorState
  configProps.onChange = onChange
  configProps.onSave = onSave
  configProps.onBlur = onSave
  configProps.style = _.assign(
    { border: '1px solid #d9d9d9', borderRadius: '4px' },
    configProps.style
  )
  return <BraftEditor {...defaultProps} {..._.omit(configProps, ['fieldOptions'])} />
}

export default withLocale(forwardRef(FanoEditor))
