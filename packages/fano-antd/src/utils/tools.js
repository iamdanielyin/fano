import React from 'react'
import XLSX from 'xlsx'
import { message, Button, Divider, Tooltip, Popconfirm } from 'antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'
import qs from 'qs'
import _ from 'lodash'

export function keywordSearchWrapper (keyword, config) {
  const url = _.get(config, 'props.url')
  const indexOf = url.indexOf('?')

  let query = {}
  let rawUrl = url
  if (indexOf >= 0) {
    query = qs.parse(url.substring(indexOf + 1))
    rawUrl = url.substring(0, indexOf)
  }
  if (_.isString(query.cond)) {
    query.cond = JSON.parse(query.cond)
  }
  query.cond = _.isPlainObject(query.cond) ? query.cond : {}

  const dataKey = _.get(config, 'props.keywordName', _.get(config, 'name', 'keyword'))
  query.cond[dataKey] = keyword
  query.cond = JSON.stringify(query.cond)
  query = qs.stringify(query)
  return `${rawUrl}?${query}`
}

export function renderTableActions (configs) {
  const children = []
  for (let i = 0; i < configs.length; i++) {
    const item = configs[i]
    if (_.has(item, 'text')) {
      item.children = item.text
    }
    // 处理按钮配置
    const omitProps = ['show', 'wrapper', 'badge', 'text', 'tooltip', 'popconfirm']
    const config = _.omit(item, omitProps)
    const hasPopconfirm = !!item.popconfirm
    if (hasPopconfirm) {
      delete config.onClick
    }
    // 生成按钮
    let child = _.isFunction(item.wrapper) ? (
      item.wrapper(<Button {...config} />)
    ) : (
      <Button {...config} />
    )
    // 处理tooltip
    if (item.tooltip) {
      if (_.isFunction(item.tooltip)) {
        child = <Tooltip {...item.tooltip()}>{child}</Tooltip>
      } else {
        child = <Tooltip title={item.tooltip}>{child}</Tooltip>
      }
    }
    // 处理popconfirm
    if (hasPopconfirm) {
      const props = _.isFunction(item.popconfirm) ? item.popconfirm() : item.popconfirm
      if (!_.isEmpty(props)) {
        if (!_.isFunction(props.onConfirm)) {
          props.onConfirm = item.onClick
        }
        child = <Popconfirm {...props}>{child}</Popconfirm>
      }
    }
    // 渲染按钮和徽标数
    children.push(
      <span className='fano-table-btn' key={`${i}`}>
        {item.badge ? (
          <span className='fano-table-btn-badge'>{item.badge}</span>
        ) : null}
        {child}
      </span>
    )
  }
  return <div className='fano-table-btns'>{joinDivider(children, 'fano-table-btn')}</div>
}

export function renderRowActions (configs, record, index) {
  const children = []
  for (let i = 0; i < configs.length; i++) {
    const item = configs[i]
    if ((_.isFunction(item.show) && !item.show(record, index)) || !_.get(item, 'show', true)) {
      continue
    }
    if (_.has(item, 'text')) {
      item.children = item.text
    }
    // 处理按钮配置
    const omitProps = ['show', 'wrapper', 'badge', 'text', 'tooltip', 'popconfirm']
    const config = {
      ..._.omit(item, omitProps),
      type: 'link'
    }
    if (_.isFunction(item.onClick)) {
      config.onClick = e => {
        e.stopPropagation()
        item.onClick(record, index)
      }
    }
    if (item.type === 'danger') {
      config.className = config.className ? `${config.className} fano-row-btn-danger` : 'fano-row-btn-danger'
    }
    // 生成按钮
    let child = _.isFunction(item.wrapper) ? (
      item.wrapper(<Button {...config} />, record, index)
    ) : (
      <Button {...config} />
    )
    // 处理tooltip
    if (item.tooltip) {
      if (_.isFunction(item.tooltip)) {
        child = <Tooltip {...item.tooltip(record, index)}>{child}</Tooltip>
      } else {
        child = <Tooltip title={item.tooltip}>{child}</Tooltip>
      }
    }
    // 处理popconfirm
    if (item.popconfirm) {
      const props = _.isFunction(item.popconfirm) ? item.popconfirm(record, index) : item.popconfirm
      if (!_.isEmpty(props)) {
        const { onClick, onCancel, onConfirm } = props
        props.onClick = e => {
          if (e && e.stopPropagation) {
            e.stopPropagation()
          }
          if (_.isFunction(onClick)) {
            onClick(record, index)
          }
        }
        props.onCancel = e => {
          if (e && e.stopPropagation) {
            e.stopPropagation()
          }
          if (_.isFunction(onCancel)) {
            onCancel(record, index)
          }
        }
        props.onConfirm = e => {
          if (e && e.stopPropagation) {
            e.stopPropagation()
          }
          if (_.isFunction(onConfirm)) {
            onConfirm(record, index)
          }
        }
        child = <Popconfirm {...props}>{child}</Popconfirm>
      }
    }
    // 渲染按钮
    children.push(
      <span className='fano-row-btn' key={`${i}`}>
        {child}
      </span>
    )
  }
  const btnCount = children.length
  return (
    <div
      className='fano-row-btns'
      style={{ minWidth: 88 * btnCount + 5 * (btnCount - 1) }}
    >
      {joinDivider(children, 'fano-row-btn')}
    </div>
  )
}

export function joinDivider (arr, dividerClassName) {
  const rets = []
  for (let i = 0; i < arr.length; i++) {
    rets.push(arr[i])
    if (i < arr.length - 1) {
      rets.push(
        <span className={dividerClassName} key={`${i}-divider`}>
          <Divider type='vertical' />
        </span>
      )
    }
  }
  return rets
}

export async function exportTable (
  columns,
  dataSource,
  filename = moment().format('YYYY-MM-DDTHH:mm:ss'),
  ext = 'xlsx',
  childrenColumns,
  childrenKey,
  childrenBlankLine = false
) {
  const headers = []
  for (const column of columns) {
    if (['actions'].includes(column.dataIndex)) {
      continue
    }
    headers.push(column.title)
  }
  const rows = [headers]
  for (const record of dataSource) {
    const row = []
    for (const column of columns) {
      let value = _.get(record, column.dataIndex)
      const exporter = _.isFunction(column.exporter) ? column.exporter : column.render
      if (_.isFunction(exporter)) {
        value = exporter(value, record, column)
      }
      row.push(value)
    }
    rows.push(row)
    // 添加子表
    if (_.isArray(childrenColumns) && !_.isEmpty(childrenColumns) &&
      _.isArray(record[childrenKey]) && !_.isEmpty(record[childrenKey])) {
      const subHeaders = ['']
      for (const subColumn of childrenColumns) {
        if (['actions'].includes(subColumn.dataIndex)) {
          continue
        }
        subHeaders.push(subColumn.title)
      }
      rows.push(subHeaders)
      for (const subRecord of record[childrenKey]) {
        const subRow = ['']
        for (const subColumn of childrenColumns) {
          let value = _.get(subRecord, subColumn.dataIndex)
          const exporter = _.isFunction(subColumn.exporter) ? subColumn.exporter : subColumn.render
          if (_.isFunction(exporter)) {
            value = exporter(value, subRecord, subColumn)
          }
          subRow.push(value)
        }
        rows.push(subRow)
      }
      if (childrenBlankLine) {
        rows.push([])
      }
    }
  }
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  // 设置表格的宽度
  ws['!cols'] = []
  columns.length > 0 && columns.map(item => {
    let width = item.width
    width = parseInt(width)
    if (!_.isNumber(width) || !_.isFinite(width) || width <= 0) {
      width = 150
    }
    ws['!cols'].push({ wpx: width })
  })
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSX.writeFile(wb, filename.endsWith(ext) ? filename : `${filename}.${ext}`)
}

export function callHook (hook, changeCallback, ...args) {
  if (_.isFunction(hook)) {
    const ret = hook(...args)
    if (ret !== undefined && !_.isBoolean(ret)) {
      if (_.isFunction(changeCallback)) {
        changeCallback(ret)
      }
    }
    return ret
  }
}

export function copy (copyText, children) {
  if (_.isEmpty(copyText)) {
    return null
  }

  let content = copyText
  if (children) {
    content = _.isFunction(children) ? children() : children
  }
  if (_.isString(content)) {
    content = (
      <a
        href='#'
        onClick={e => {
          e.stopPropagation()
        }}
      >
        {content}
      </a>
    )
  }
  return (
    <CopyToClipboard
      text={copyText}
      onCopy={() => message.success(_.get(window.localeMessages, 'kuu_copy_success') || 'Copy successfully.', 0.5)}
    >
      {content}
    </CopyToClipboard>
  )
}

export function getResponsivePropsByColumns (cols, defaultProps = {}) {
  let layout
  switch (cols) {
    case 1:
      layout = {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 24,
        xl: 24,
        xxl: 24
      }
      break
    case 2:
      layout = {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 12,
        xl: 12,
        xxl: 12
      }
      break
    case 3:
      layout = {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 8,
        xl: 8,
        xxl: 8
      }
      break
    case 4:
      layout = {
        xs: 24,
        sm: 24,
        md: 12,
        lg: 8,
        xl: 8,
        xxl: 6
      }
      break
    default:
      layout = defaultProps
      break
  }
  return layout
}
