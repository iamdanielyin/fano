import React, { useImperativeHandle, forwardRef } from 'react'
import _ from 'lodash'
import { withLocale } from 'kuu-tools'

function FanoRender (props, ref) {
  useImperativeHandle(ref, () => ({}))
  const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
  configProps.value = props.value
  configProps.onChange = e => {
    const value = _.has(e, 'target') ? e.target.value : e
    if (_.isFunction(props.emit)) {
      props.emit(`${props.path}:change`, value)
    }
    if (_.isFunction(props.onChange)) {
      props.onChange(value)
    }
  }

  return (
    <div className='fano-render'>
      {configProps.render(_.omit(props, ['config.props.render']))}
    </div>
  )
}

export default withLocale(forwardRef(FanoRender))
