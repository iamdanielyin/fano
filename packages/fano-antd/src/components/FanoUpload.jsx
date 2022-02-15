import React from 'react'
import _ from 'lodash'
import { Upload, Button, message } from 'antd'
import { withLocale, withPrefix } from 'kuu-tools'

class FanoUpload extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      loading: false,
      fileList: []
    }
  }

  getFilename (url) {
    if (url.includes('?')) {
      url = /(.*)\?/.exec(url)[1]
    }
    const name = url.substr(url.lastIndexOf('/') + 1)
    return name
  }

  getValidArray (value) {
    if (_.isArray(value)) {
      return value
    }
    if (![null, undefined].includes(value)) {
      return [value]
    }
    return []
  }

  render () {
    const { props } = this
    const configProps = _.assign({
      name: 'file',
      action: withPrefix('/upload'),
      children: (
        <Button icon={this.state.loading ? 'loading' : 'plus'}>
          {this.props.L('fano_upload_button', 'Click to Upload')}
        </Button>
      )
    }, _.get(props, 'config.props', {}))
    configProps.className = configProps.className ? `${configProps.className} fano-upload` : 'fano-upload'
    const multiple = _.get(configProps, 'multiple', false)
    const onlyUrl = _.get(configProps, 'onlyUrl', false)
    if (this.state.loading) {
      configProps.fileList = this.state.fileList
    } else {
      configProps.fileList = this.getValidArray(props.value)
      let list = []
      for (const item of configProps.fileList) {
        let file
        if (_.isString(item)) {
          file = {
            uid: item,
            name: this.getFilename(item),
            status: 'done',
            url: item
          }
        } else if (_.isPlainObject(item)) {
          file = {
            uid: _.get(item, 'uid', _.get(item, 'UID')),
            name: _.get(item, 'name', _.get(item, 'Name')),
            status: _.get(item, 'status', _.get(item, 'Status')),
            url: _.get(item, 'url', _.get(item, 'URL'))
          }
        }
        if (file) {
          list.push(file)
        }
      }
      if (!_.isEmpty(this.state.fileList)) {
        list = list.concat(this.state.fileList.filter(item => item.status === 'uploading'))
      }
      configProps.fileList = list
    }
    configProps.onChange = info => {
      if (info.file.status === 'uploading') {
        this.setState({ loading: true, fileList: info.fileList })
        return
      }
      if (['removed', 'done'].includes(info.file.status)) {
        let value
        switch (info.file.status) {
          case 'removed':
            if (multiple) {
              value = this.getValidArray(props.value)
              value = value.filter(item => _.get(item, 'uid', _.get(item, 'UID')) !== _.get(info.file, 'uid', _.get(info.file, 'UID')))
            }
            break
          case 'done':
            if (multiple) {
              value = this.getValidArray(props.value)
              const { fileList } = info
              for (const item of fileList) {
                if (item.status === 'done') {
                  const data = _.get(item, 'response.data')
                  if (data) {
                    if (onlyUrl) {
                      if (_.isString(data)) {
                        value.push(data)
                      } else if (_.isPlainObject(data)) {
                        value.push(_.get(data, 'url', _.get(data, 'URL')))
                      }
                    } else {
                      value.push(data)
                    }
                  }
                }
              }
            } else {
              const data = _.get(info.file, 'response.data', info.file)
              if (onlyUrl) {
                if (_.isString(data)) {
                  value = data
                } else if (_.isPlainObject(data)) {
                  value = _.get(data, 'url', _.get(data, 'URL'))
                }
              } else {
                value = data
              }
            }
            break
        }
        value = _.cloneDeep(value)
        // 向上传递
        if (_.isFunction(props.emit)) {
          props.emit(`${props.path}:change`, value)
        }
        if (_.isFunction(props.onChange)) {
          props.onChange(value)
        }
      } else if (info.file.status === 'error') {
        const msg = _.get(info.file, 'response.msg')
        if (msg) {
          message.error(msg)
        }
      }
      this.setState({ loading: false })
    }
    if (_.isFunction(configProps.children)) {
      configProps.children = configProps.children(configProps.fileList, props)
    }
    return configProps.dragger ? <Upload.Dragger {...configProps} /> : <Upload {...configProps} />
  }
}

export default withLocale(FanoUpload)
