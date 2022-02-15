import React from 'react'
import { withLocale } from 'kuu-tools'

class FanoPlainText extends React.PureComponent {
  render () {
    const { props } = this
    return <span className='fano-plaintext ant-form-text'>{props.value}</span>
  }
}

export default withLocale(FanoPlainText)
