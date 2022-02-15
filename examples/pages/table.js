import React from 'react'
import { FanoTable, FanoRate, FanoTags, FanoSlider } from 'fano-antd'
import styles from './index.less'

export default class ExampleTable extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '纯文本',
          dataIndex: 'plaintext'
        },
        {
          title: '输入框',
          dataIndex: 'input'
        },
        {
          title: '评分',
          dataIndex: 'rate',
          render: 'rate'
        },
        {
          title: '整型输入框',
          dataIndex: 'integer'
        },
        {
          title: '浮点型输入框',
          dataIndex: 'number'
        },
        {
          title: '标签',
          dataIndex: 'tags',
          render: 'tags'
        },
        {
          title: '上传组件',
          dataIndex: 'upload',
          render: 'image'
        },
        {
          title: '日期选择器',
          dataIndex: 'datepicker',
          render: 'date,YYYY-MM-DD'
        },
        {
          title: '时间范围选择器',
          dataIndex: 'rangepicker',
          render: dates =>
            `${_.get(dates, '[0]', '-')} ~ ${_.get(dates, '[1]', '-')}`
        },
        {
          title: '月份选择器',
          dataIndex: 'monthpicker',
          render: 'date,YYYY-MM'
        },
        {
          title: '周选择器',
          dataIndex: 'weekpicker'
        },
        {
          title: '时间选择器',
          dataIndex: 'timepicker'
        },
        {
          title: '颜色选择器',
          dataIndex: 'color',
          render: 'color'
        },
        {
          title: '滑动输入条',
          dataIndex: 'slider',
          render: 'slider'
        }
      ],
      dataSource: _.range(40).map(item => ({
        key: item + 1,
        plaintext: 'China' + item,
        input: 'zhangsan' + item,
        password: 'zhang12' + item,
        integer: 289800 * 10 * _.random(item),
        number: 39002.33 + _.random(item, true),
        radio: '1',
        checkbox: ['1'],
        select: ['2', '41'],
        tree: [
          {
            uid: '-1',
            name: 'xxx.png',
            status: 'done',
            url:
              'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
          }
        ],
        // tags: [ {label: 'AI', checked: true}, {label: '机器学习', checked: true}, {label: 'DevOps', checked: true} ],
        tags: ['AI', '机器学习', 'DevOps'],
        rate: _.random(1, 5),
        slider: _.random(10, 100),
        upload: [
          'https://o05g5zevc.qnssl.com/fbee2421-e340-4350-b759-fa5e1718b56d/collage-1572831_1280.jpg?imageMogr2/auto-orient/strip/thumbnail/!60x60r/gravity/Center/crop/60x60',
          'https://o05g5zevc.qnssl.com/9936eb2c-01e5-472b-8e1b-6e35e09632be/apple-871316_1280.jpg?imageMogr2/auto-orient/strip/thumbnail/!60x60r/gravity/Center/crop/60x60'
        ],
        color: [
          ['red', '#108ee9', '#87d068', '#2db7f5', '#f50'][_.random(0, 5)],
          ['red', '#108ee9', '#87d068', '#2db7f5', '#f50'][_.random(0, 5)]
        ]
      })),
      form: [
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
            button: true,
            url: '/api/radio/options',
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
            url:
              'https://a.example.com/api/v1/user?access_token=DEBUG&project={%22wechat_sites%22:0,%22sites%22:0,%22roles%22:0,%22department%22:0}'
          }
        },
        {
          name: 'tree',
          type: 'tree',
          label: '树选择器',
          props: {
            url: '/api/tree/options'
          }
        },
        {
          name: 'tags',
          type: 'tags',
          label: '标签'
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
            },
            formItemProps: {
              labelCol: {
                xs: { span: 24 },
                sm: { span: 8 }
              },
              wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
              }
            }
          }
        }
      ]
    }
  }

  render () {
    const { dataSource, columns, form } = this.state
    return <FanoTable dataSource={dataSource} columns={columns} form={form} />
  }
}
