import React from 'react'
import _ from 'lodash'
import Fano from 'fano-antd'
import styles from './index.less'

export const config = [
  {
    name: 'plaintext',
    type: 'plaintext',
    label: '纯文本'
  },
  {
    name: 'input',
    type: 'input',
    label: '输入框',
    props: {
      placeholder: '请输入账号',
      disabled: false
    }
  },
  {
    name: 'password',
    type: 'input',
    label: '密码框',
    props: {
      type: 'password',
      placeholder: '请填写密码',
      disabled: false
    }
  },
  {
    name: 'integer',
    type: 'number',
    label: '整型输入框',
    props: {
      precision: 0
    }
  },
  {
    name: 'number',
    type: 'number',
    label: '浮点型输入框'
  },
  {
    name: 'rate',
    type: 'rate',
    label: '评分',
    props: {
      allowHalf: true
    }
  },
  {
    name: 'slider',
    type: 'slider',
    label: '滑动输入条'
  },
  {
    name: 'color',
    type: 'color',
    label: '颜色选择器'
  },
  {
    name: 'radio',
    type: 'radio',
    label: '单选框',
    props: {
      options: [
        {
          label: '未知0',
          value: '0'
        },
        {
          label: '男1',
          value: '1'
        },
        {
          label: '女2',
          value: '2'
        }
      ]
    }
  },
  {
    name: 'checkbox',
    type: 'checkbox',
    label: '多选框',
    props: {
      options: [
        {
          label: '动漫',
          value: '0'
        },
        {
          label: '电影',
          value: '1'
        },
        {
          label: '音乐',
          value: '2'
        },
        {
          label: '歌剧',
          value: '3'
        }
      ]
    }
  },
  {
    name: 'select',
    type: 'select',
    label: '选择器',
    props: {
      labelKey: 'name',
      valueKey: '_id',
      url:
        'https://a.example.com/api/v1/user?access_token=DEBUG&project={%22wechat_sites%22:0,%22sites%22:0,%22roles%22:0,%22department%22:0}'
    }
  },
  {
    name: 'tree',
    type: 'tree',
    label: '树选择器',
    props: {
      url: '/api/tree/options',
      arrayToTree: {
        customID: 'value',
        parentProperty: 'pid',
        childrenProperty: 'children'
      }
    }
  },
  {
    name: 'tags',
    type: 'tags',
    label: '标签',
    props: {
      checkable: true
    }
  },
  {
    name: 'datepicker',
    type: 'datepicker',
    label: '日期选择器'
  },
  {
    name: 'rangepicker',
    type: 'rangepicker',
    label: '时间范围选择器'
  },
  {
    name: 'monthpicker',
    type: 'monthpicker',
    label: '月份选择器'
  },
  {
    name: 'weekpicker',
    type: 'weekpicker',
    label: '周选择器'
  },
  {
    name: 'timepicker',
    type: 'timepicker',
    label: '时间选择器'
  },
  {
    name: 'upload',
    type: 'upload',
    label: '上传组件',
    props: {
      dragger: true,
      action: '/api/v1/upload?access_token=DEBUG'
    }
  },
  {
    name: 'textarea',
    type: 'textarea',
    label: '大文本',
    props: {
      rows: 4
    }
  },
  {
    name: 'editor',
    type: 'editor',
    label: '编辑器',
    props: {
      layout: {
        colProps: {
          span: 24
        }
      }
    }
  }
]
export const value = {
  plaintext: 'China',
  input: 'zhangsan',
  password: 'zhang123',
  integer: 289800,
  number: 39002.33,
  radio: '1',
  checkbox: ['1'],
  select: '001793',
  tree: [
    {
      uid: '-1',
      name: 'xxx.png',
      status: 'done',
      url: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
    }
  ],
  tags: [
    { label: 'AI', checked: true },
    { label: '机器学习', checked: true },
    { label: 'DevOps', checked: true }
  ],
  rate: 3.5,
  slider: 50
}

export default class ExamplePage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value,
      config
    }

    this.onChange = this.onChange.bind(this)
  }

  onChange (changedValues, allValues) {
    this.setState({ changedValues, allValues })
  }

  render () {
    const { value, config } = this.state
    return (
      <div className={styles.normal}>
        <h1>Page index</h1>
        <Fano
          config={config}
          value={value}
          onChange={this.onChange}
          onSubmit={(err, values) => {
            console.log(err, values)
          }}
        />
      </div>
    )
  }
}
