import React from 'react'
import moment from 'moment'
import { FanoTable } from 'fano-antd'

const dateFormat = 'YYYY-MM-DD HH:mm:ss'

export default class UserTable extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: '名称',
          dataIndex: 'Subject'
        },
        {
          title: '价格',
          dataIndex: 'Price'
        },
        {
          title: '购买日期',
          dataIndex: 'Date',
          render: t => moment(t).format(dateFormat)
        },
        {
          title: '是否打折',
          dataIndex: 'IsDiscount',
          render: 'switch'
        },
        {
          title: '用户备注',
          dataIndex: 'UserRemark'
        }
      ],
      form: [
        {
          name: 'Subject',
          type: 'input',
          label: '名称'
        },
        {
          name: 'Price',
          type: 'number',
          label: '价格'
        },
        {
          name: 'Date',
          type: 'datepicker',
          label: '购买日期',
          props: {
            format: dateFormat,
            formatValue: value => (value ? moment(value) : undefined),
            parseValue: date => (date ? date.toDate().toISOString() : undefined)
          }
        },
        {
          name: 'IsDiscount',
          type: 'switch',
          label: '是否打折'
        },
        {
          name: 'UserRemark',
          type: 'textarea',
          label: '用户备注',
          props: {
            rows: 4
          }
        }
      ]
    }
  }

  render () {
    const { columns, form } = this.state
    return <FanoTable columns={columns} form={form} url={'/api/book'} />
  }
}
