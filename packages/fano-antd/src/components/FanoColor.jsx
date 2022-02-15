import React from 'react'
import _ from 'lodash'
import { withLocale } from 'kuu-tools'
import {
  AlphaPicker,
  BlockPicker,
  ChromePicker,
  CirclePicker,
  CompactPicker,
  GithubPicker,
  HuePicker,
  MaterialPicker,
  PhotoshopPicker,
  SketchPicker,
  SliderPicker,
  SwatchesPicker,
  TwitterPicker
} from 'react-color'

const pickersMap = {
  alpha: AlphaPicker,
  block: BlockPicker,
  chrome: ChromePicker,
  circle: CirclePicker,
  compact: CompactPicker,
  github: GithubPicker,
  hue: HuePicker,
  material: MaterialPicker,
  photoshop: PhotoshopPicker,
  sketch: SketchPicker,
  slider: SliderPicker,
  swatches: SwatchesPicker,
  twitter: TwitterPicker
}

class FanoColor extends React.PureComponent {
  render () {
    const { props } = this
    const configProps = _.cloneDeep(_.get(props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-color` : 'fano-color'
    configProps.color = props.value
    configProps.onChangeComplete = color => {
      const value = color.hex
      if (_.isFunction(props.emit)) {
        props.emit(`${props.path}:change`, value)
      }
      if (_.isFunction(props.onChange)) {
        props.onChange(value)
      }
    }
    const ColorPicker = pickersMap[_.get(configProps, 'type', 'slider').toLowerCase()]
    return <ColorPicker {..._.omit(configProps, ['type'])} />
  }
}

export default withLocale(FanoColor)
