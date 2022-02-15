import React from 'react'
import qs from 'qs'
import _ from 'lodash'
import md5 from 'blueimp-md5'
import FanoForm, { types } from '../index'
import {
  Table,
  Tabs,
  Button,
  Popconfirm,
  Popover,
  List,
  Checkbox,
  Select,
  Icon,
  Input,
  Tooltip,
  message,
  Drawer,
  Pagination,
  Spin,
  Upload,
  Row,
  Col
} from 'antd'
import arrayToTree from 'array-to-tree'
import { autoFetch, parseAutoUrl, withPrefix, withLocale } from 'kuu-tools'
import {
  renderTableActions,
  renderRowActions,
  exportTable,
  callHook,
  getResponsivePropsByColumns
} from '../utils/tools'
import defaultRenders from '../utils/renders'

const safeTypeOperators = {
  input: ['like', 'eq'],
  number: ['eq', 'gt', 'lt'],
  textarea: ['like', 'eq'],
  radio: ['eq'],
  select: ['eq'],
  treeselect: ['eq'],
  datepicker: ['eq', 'gt', 'lt'],
  monthpicker: ['eq', 'gt', 'lt'],
  weekpicker: ['eq', 'gt', 'lt'],
  timepicker: ['eq', 'gt', 'lt'],
  rangepicker: ['gtlte', 'gtelt', 'gtlt', 'gtelte'],
  rate: ['eq'],
  slider: ['eq'],
  switch: ['eq'],
  progress: ['eq'],
  plaintext: ['eq'],
  color: ['eq']
}

class FanoTable extends React.PureComponent {
  constructor (props) {
    super(props)

    this.form = React.createRef()
    this.searchForm = React.createRef()
    this.state = {
      listLoading: false,
      drawerVisible: false,
      drawerFullScreen: false,
      filterPopoverVisible: false,
      sortPopoverVisible: false,
      invisibleCols: {},
      searchCollapsed: true, // 搜索栏是否收起状态
      sort: this.parseDefaultSort(),
      cond: [],
      expandedRowKeys: [],
      expandedRawAllKeys: [],
      filterFields: [],
      condtype: 'and',
      resetCurrentPage: false,
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30', '100', '5000'],
        onChange: page => {
          const pagination = { ...this.state.pagination }
          _.set(pagination, 'current', page)
          this.setState({ pagination }, this.handleRefresh)
        },
        onShowSizeChange: (current, pageSize) => {
          const pagination = { ...this.state.pagination }
          _.set(pagination, 'current', current)
          _.set(pagination, 'pageSize', pageSize)
          this.setState({ pagination }, this.handleRefresh)
        }
      }
    }

    this.getPropValue = this.getPropValue.bind(this)
    this.deleteWrapper = this.deleteWrapper.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handleRefresh = this.handleRefresh.bind(this)
    this.handleSiderSave = this.handleSiderSave.bind(this)
    this.handleCreate = this.handleCreate.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.handleSortPopoverVisibleChange = this.handleSortPopoverVisibleChange.bind(this)
    this.handleFilterPopoverVisibleChange = this.handleFilterPopoverVisibleChange.bind(this)
    this.handleCondAddRule = this.handleCondAddRule.bind(this)
    this.setFormValue = this.setFormValue.bind(this)
    this.getFormValue = this.getFormValue.bind(this)
    this.getFormType = this.getFormType.bind(this)
    this.isEdit = this.isEdit.bind(this)
    this.setSelectedRows = this.setSelectedRows.bind(this)
    this.getSelectedRows = this.getSelectedRows.bind(this)
    this.handleRowSelected = this.handleRowSelected.bind(this)
    this.handleDrawerClose = this.handleDrawerClose.bind(this)
    this.toggleDrawerVisible = this.toggleDrawerVisible.bind(this)
    this.resetSearchForm = this.resetSearchForm.bind(this)
    this.getSearchFormValue = this.getSearchFormValue.bind(this)
    this.setSearchFormValue = this.setSearchFormValue.bind(this)
    this.rerender = this.rerender.bind(this)

    this.filterFields = []
    this.filterFieldsMap = {}

    this.updateColumnsMap(props.columns)
    this.updateFormItemsMap(props.form)
    this.state.filterFields = this.updateFilterMap(props.filter, props.columns)
    if (!_.isEmpty(props.filterInitialValue)) {
      this.state.cond = this.getFilterCondByValue(props.filterInitialValue)
    }
    this.state.invisibleCols = JSON.parse(window.localStorage.getItem(this.getCacheInvisibleColsKey()) || '{}')
  }

  parseDefaultSort () {
    const query = this.parseUrlQuery(this.getPropValue('listUrl'))
    const raw = _.get(query.sort || '')
    const sort = raw
      ? raw
        .split(',')
        .map(item =>
          item.startsWith('-')
            ? { key: item.replace('-', ''), type: 'desc' }
            : { key: item, type: 'asc' }
        )
      : []
    for (const item of this.props.columns) {
      if (_.has(item, 'defaultSortOrder')) {
        switch (item.defaultSortOrder) {
          case 'ascend':
            sort.push({ key: item.dataIndex, type: 'asc' })
            break
          case 'descend':
            sort.push({ key: item.dataIndex, type: 'desc' })
            break
        }
      }
    }
    return sort
  }

  parseUrlQuery (url) {
    return qs.parse(_.get(/\?(.*)/.exec(url), '[1]'))
  }

  componentDidMount () {
    if (_.get(this.props, 'fetchOnInit', true)) {
      this.handleRefresh()
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) { // eslint-disable-line
    let filter
    let columns
    let updateFilter = false
    if (JSON.stringify(nextProps.form) !== JSON.stringify(this.props.form)) {
      this.updateFormItemsMap(nextProps.form)
      filter = this.props.filter
      columns = this.props.columns
      updateFilter = true
    }
    if (JSON.stringify(nextProps.columns) !== JSON.stringify(this.props.columns)) {
      this.updateColumnsMap(nextProps.columns)
      filter = filter === undefined ? this.props.filter : filter
      columns = nextProps.columns
      updateFilter = true
    }
    if (JSON.stringify(nextProps.filter) !== JSON.stringify(this.props.filter)) {
      filter = nextProps.filter
      columns = columns === undefined ? this.props.columns : columns
      updateFilter = true
    }
    if (updateFilter) {
      const filterFields = this.updateFilterMap(filter, columns)
      const newState = { filterFields }
      // if (!_.isEmpty(this.props.filterInitialValue)) {
      //   newState.cond = this.getFilterCondByValue(this.props.filterInitialValue)
      // }
      this.setState(newState)
    }
  }

  updateColumnsMap (columns) {
    this.columnsMap = _.chain(columns)
      .groupBy('dataIndex')
      .mapValues(values => _.head(values))
      .value()
  }

  updateFormItemsMap (form) {
    this.formItemsMap = _.chain(_.cloneDeep(form || []))
      .groupBy('name')
      .mapValues(values => {
        const item = _.head(values)
        item.label = item.label || _.get(this.columnsMap[item.name], 'title')
        return item
      })
      .value()
  }

  updateFilterMap (filter, columns) {
    this.filterFields = this.getFilterFields(filter, columns)
    this.filterFieldsMap = _.chain(this.filterFields)
      .groupBy('name')
      .mapValues(values => {
        const item = _.head(values)
        item.operators = this.getFilterOperators(item, item.operators)
        return item
      })
      .value()
    return this.filterFields || []
  }

  rerender () {
    this.setState({ dataSource: [...(this.state.dataSource || [])] })
  }

  getFilterFields (filter, columns) {
    filter = (filter || []).map(item => _.isString(item) ? { name: item } : item)
    const filterMap = _.chain(filter)
      .groupBy('name')
      .mapValues(values => _.head(values))
      .value()
    let fields
    if (this.props.filterReplace === true) {
      fields = filter
    } else {
      // 生成字段列表
      fields = columns
        .filter(col => {
          // 非数据列
          if (['actions'].includes(col.dataIndex)) {
            return false
          }
          // 引用字段
          if (col.dataIndex.includes('.')) {
            return false
          }
          // 不包含表单配置，无法预知类型
          if (!this.formItemsMap[col.dataIndex]) {
            return false
          }
          const formItemConfig = this.formItemsMap[col.dataIndex]
          // 过滤特殊类型：密码
          if (formItemConfig.type === 'input' && _.get(formItemConfig.props, 'type') === 'password') {
            return false
          }
          // 包含表单配置且必须为安全类型
          return _.has(safeTypeOperators, formItemConfig.type)
        })
        .map(col => ({ name: col.dataIndex }))
      fields = fields.concat(..._.differenceBy(filter, fields, 'name'))
    }
    const ret = []
    for (let item of fields) {
      if (this.formItemsMap[item.name] && this.props.filterReplace !== true) {
        const formItemConfig = _.cloneDeep(this.formItemsMap[item.name])
        _.set(formItemConfig, 'props.layout', undefined)
        item = { ...formItemConfig, ...filterMap[item.name] }
      } else if (this.columnsMap[item.name]) {
        item = {
          name: item.name,
          label: this.columnsMap[item.name].title,
          ...filterMap[item.name]
        }
      }
      if (['plaintext', 'table'].includes(item.type)) {
        continue
      }
      if (this.props.filterReplace !== true) {
        if (_.get(item, 'props.disabled') === true) {
          _.set(item, 'props.disabled', false)
        }
      }
      if (!item.type || ['input', 'number', 'select', 'treeselect', 'datepicker', 'rangepicker', 'monthpicker', 'weekpicker', 'timepicker'].includes(item.type)) {
        _.set(item, 'props.allowClear', true)
      }
      if (item.name && item.label) {
        ret.push(item)
        delete filterMap[item.name]
      }
    }
    // 添加不在列中的自定义过滤项
    if (!_.isEmpty(filterMap)) {
      for (const item of filter) {
        if (filterMap[item.name] && item.name && item.label) {
          ret.push(item)
        }
      }
    }
    return _.cloneDeep(ret)
  }

  getFilterOperators (item, keys) {
    if (_.isEmpty(keys) || !_.isArray(keys)) {
      const type = item.type || _.get((this.formItemsMap || {})[item.name], 'type')
      // ['like', 'eq', 'gt', 'lt', 'gte', 'lte', 'gtlt', 'gtlte', 'gtelt', 'gtelte', 'ne', 'null', 'notnull']
      keys = safeTypeOperators[type] || ['eq']
    }
    const labelMap = {
      like: this.props.L('fano_table_filter_operators_like', 'Contains'),
      eq: '=',
      gt: '>',
      lt: '<',
      gte: '>=',
      lte: '<=',
      gtlt: 'a < x < b',
      gtlte: 'a < x <= b',
      gtelt: 'a <= x < b',
      gtelte: 'a <= x <= b',
      ne: '!=',
      null: this.props.L('fano_table_filter_operators_null', 'IS NULL'),
      notnull: this.props.L('fano_table_filter_operators_notnull', 'IS NOT NULL')
    }
    return keys.map(key => ({ value: key, label: labelMap[key] }))
  }

  getDataSource () {
    return _.has(this.props, 'dataSource')
      ? this.props.dataSource
      : this.state.dataSource
  }

  handleRefresh (fetch) {
    fetch = _.isBoolean(fetch) ? fetch : false
    this.setState({ filterPopoverVisible: false, sortPopoverVisible: false })
    if (!fetch && _.isFunction(this.props.onFilter) && this.state.rawDataSource) {
      this.setState({ listLoading: true }, () => {
        const newState = { listLoading: false }
        const newDataSource = this.props.onFilter(_.cloneDeep(this.state.cond), _.cloneDeep(this.state.rawDataSource))
        if (_.isArray(newDataSource)) {
          newState.dataSource = newDataSource
        }
        this.setState(newState)
      })
      return
    }
    this.fetchList()
  }

  handleFilterPopoverVisibleChange (visible) {
    this.setState({ filterPopoverVisible: visible })
  }

  handleSortPopoverVisibleChange (visible) {
    this.setState({ sortPopoverVisible: visible })
  }

  getFormValue (fieldNames) {
    return this.form.current ? this.form.current.getFieldsValue(fieldNames) : undefined
  }

  setFormValue (newValues, all) {
    if (this.form.current) {
      this.form.current.setFieldsValue(newValues, all)
    }
  }

  getFormType () {
    const rowKey = this.getPropValue('rowKey')
    const { formRecord } = this.state
    return _.has(formRecord, rowKey) ? 'UPDATE' : 'CREATE'
  }

  isEdit (record, rowKey) {
    if (record === undefined) {
      record = this.state.formRecord
    }
    if (rowKey === undefined) {
      rowKey = this.getPropValue('rowKey')
    }
    return !!_.get(record, `${rowKey}`)
  }

  handleAdd (newInitialValue = {}, drawerVisible = true, callback) {
    const cb = () => {
      const formInitialValue = { ...(this.props.formInitialValue || {}), ...newInitialValue }
      const state = {
        formRecord: formInitialValue,
        formChangedValues: formInitialValue
      }
      if (_.isBoolean(drawerVisible)) {
        state.drawerVisible = drawerVisible
      }
      this.setState(state, callback)
    }
    this.form.current ? this.form.current.reset(cb) : cb()
  }

  handleRowSelected (record, needSetState = true) {
    if (this.getRecordDisabled(record)) {
      return
    }

    const rowKey = this.getPropValue('rowKey')
    const state = {}
    let { selectedRowKeys = [], selectedRows = [] } = this.state
    const key = record[rowKey]
    const exists = _.includes(selectedRowKeys, key)
    if (exists) {
      selectedRowKeys = selectedRowKeys.filter(o => o !== key)
      selectedRows = selectedRows.filter(o => o[rowKey] !== key)
    } else {
      selectedRowKeys.push(key)
      selectedRows.push(record)
    }
    state.selectedRowKeys = [...selectedRowKeys]
    state.selectedRows = [...selectedRows]
    if (needSetState) {
      this.setState(state)
    }
    callHook(this.props.onRowSelectionChange, null, state.selectedRowKeys, state.selectedRows)
    return state
  }

  getSelectedRows () {
    return _.pick(this.state, ['selectedRowKeys', 'selectedRows'])
  }

  setSelectedRows (selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows })
  }

  convertCondItem (item) {
    switch (item.op) {
      case 'eq':
        return { [item.name]: { $eq: item.value } }
      case 'ne':
        return { [item.name]: { $ne: item.value } }
      case 'gt':
        return { [item.name]: { $gt: item.value } }
      case 'gte':
        return { [item.name]: { $gte: item.value } }
      case 'lt':
        return { [item.name]: { $lt: item.value } }
      case 'lte':
        return { [item.name]: { $lte: item.value } }
      case 'gtlt':
        return { [item.name]: { $gt: _.get(item, 'value[0]'), $lt: _.get(item, 'value[1]') } }
      case 'gtlte':
        return { [item.name]: { $gt: _.get(item, 'value[0]'), $lte: _.get(item, 'value[1]') } }
      case 'gtelt':
        return { [item.name]: { $gte: _.get(item, 'value[0]'), $lt: _.get(item, 'value[1]') } }
      case 'gtelte':
        return { [item.name]: { $gte: _.get(item, 'value[0]'), $lte: _.get(item, 'value[1]') } }
      case 'like':
        return { [item.name]: { $regex: item.value } }
      case 'null':
        return { [item.name]: { $exists: false } }
      case 'notnull':
        return { [item.name]: { $exists: true } }
    }
  }

  getListQuery () {
    const url = this.getPropValue('listUrl')
    // 处理查询参数
    const query = this.parseUrlQuery(url)
    // 处理sort
    if (!_.isEmpty(this.state.sort)) {
      query.sort = this.state.sort
        .map(o => {
          const sortKey = _.get(this.columnsMap, `${o.key}.sortKey`, o.key)
          return o.type === 'desc' ? `-${sortKey}` : sortKey
        })
        .join(',')
    }
    // 处理cond
    if (!_.isEmpty(query.cond) && _.isString(query.cond)) {
      try {
        query.cond = JSON.parse(query.cond)
      } catch (e) {
        console.error('\'cond\' has been ignored because it is not a valid JSON string')
        delete query.cond
      }
    }
    const cond = _.chain(this.state.cond)
      .filter(item => ['null', 'notnull'].includes(item.op) || !['', null, undefined, NaN].includes(item.value))
      .map(item => {
        const onCond = _.get(this.filterFieldsMap, `${item.name}.onCond`)
        if (_.isFunction(onCond)) {
          return onCond(item)
        }
        if (item.name.includes('.')) {
          const indexOf = item.name.indexOf('.')
          const firstKey = item.name.substring(0, indexOf)
          const lastKey = item.name.substr(indexOf + 1)
          return { [firstKey]: this.convertCondItem({ name: lastKey, op: item.op, value: item.value }) }
        }
        return this.convertCondItem(item)
      })
      .value()
    if (!_.isEmpty(cond)) {
      if (this.state.condtype === 'and') {
        if (_.get(query.cond, '$and') && _.isArray(query.cond.$and)) {
          query.cond.$and = _.concat(query.cond.$and, cond)
        } else {
          _.set(query, 'cond.$and', cond)
        }
      } else {
        if (_.get(query.cond, '$or') && _.isArray(query.cond.$or)) {
          query.cond.$or = _.concat(query.cond.$or, cond)
        } else {
          _.set(query, 'cond.$or', cond)
        }
      }
    }
    callHook(this.props.onCond, newValues => (query.cond = newValues), query.cond)
    query.cond = JSON.stringify(query.cond)
    // 处理分页
    if (!_.isEmpty(this.state.pagination)) {
      if (this.state.pagination.current > 0) {
        query.page = this.state.resetCurrentPage ? 1 : this.state.pagination.current
      }
      if (this.state.pagination.pageSize > 0) {
        query.size = this.state.pagination.pageSize
      }
    }
    return query
  }

  fetchList () {
    if (this.refreshing) {
      return
    }

    this.refreshing = true
    let url = this.getPropValue('listUrl')
    if (url) {
      this.setState({ listLoading: true }, async () => {
        const state = { listLoading: false, pagination: { ...this.state.pagination }, selectedRowKeys: [], selectedRows: [] }
        if (this.state.resetCurrentPage) {
          _.set(state, 'pagination.current', 1)
          _.set(state, 'resetCurrentPage', false)
        }
        try {
          // 处理查询参数
          let query = this.getListQuery()
          callHook(this.props.beforeList, newValues => (query = newValues), query)
          url = `${url.replace(/\?.*/, '')}?${qs.stringify(query)}`
          let json = await autoFetch(url)
          json = json || {}
          callHook(this.props.afterList, newValues => (json = newValues), json)
          if (_.isArray(json)) {
            json = { list: json }
          }
          json.list = _.isArray(json.list) ? json.list : []
          if (this.props.expandAllRows) {
            state.expandedRawAllKeys = json.list.map(item => item[this.getPropValue('rowKey')])
            state.expandedRowKeys = state.expandedRawAllKeys
          }
          if (this.props.arrayToTree) {
            json.list = arrayToTree(json.list, _.assign({
              customID: 'ID',
              parentProperty: 'Pid',
              childrenProperty: 'children'
            }, this.props.arrayToTree))
          }
          state.json = json
          _.set(
            state,
            'pagination.current',
            _.get(json, 'page', _.get(this.state, 'pagination.current', 1))
          )
          _.set(
            state,
            'pagination.pageSize',
            _.get(json, 'size', _.get(this.state, 'pagination.pageSize', 10))
          )
          _.set(
            state,
            'pagination.total',
            _.get(
              json,
              'totalrecords',
              _.size(json.list)
            )
          )
          // 处理dataSource
          let dataSource
          if (_.isArray(json)) {
            dataSource = json
          } else if (_.has(json, 'data')) {
            if (_.isArray(_.get(json, 'data'))) {
              dataSource = json.data
            } else if (_.isArray(_.get(json, 'data.list'))) {
              dataSource = json.data.list
            }
          } else if (_.isArray(_.get(json, 'list'))) {
            dataSource = json.list
          }
          state.dataSource = dataSource
          state.rawDataSource = state.dataSource
        } catch (error) {
          console.error(error)
        } finally {
          this.setState(state)
          this.refreshing = false
        }
      })
    }
  }

  toggleDrawerVisible (visible, record, showTabKeys) {
    callHook(this.props.onDrawerVisibleChange, null, visible, record)
    const cb = () => {
      this.setState({
        drawerVisible: _.isBoolean(visible) ? visible : !this.state.drawerVisible,
        showTabKeys
      })
    }
    if (record !== undefined) {
      this.handleFormRecord(record, false, null, cb)
    } else {
      cb()
    }
  }

  handleDrawerClose () {
    this.toggleDrawerVisible()
  }

  async handleSiderSave (err) {
    if (err) {
      return
    }
    const rowKey = this.getPropValue('rowKey')
    const { formRecord } = this.state
    const callback = async (ret) => {
      if (_.isEmpty(ret)) {
        return
      }

      this.handleRefresh(true)
      message.success(this.props.L('fano_table_save_success', 'Successfully saved'))
      const state = { formChangedValues: undefined }
      if (!this.state.closeDrawerAfterSave) {
        state.formRecord = undefined
        state.drawerVisible = false
      }
      this.setState(state)
    }
    if (_.has(formRecord, rowKey)) {
      await this.handleUpdate(callback)
    } else {
      await this.handleCreate(callback)
    }
  }

  async handleCreate (callback) {
    const rowKey = this.getPropValue('rowKey')
    const url = this.getPropValue('createUrl')
    let { formChangedValues, rawFormRecord } = this.state
    if (_.isFunction(this.props.onCreate)) {
      this.props.onCreate(formChangedValues)
    } else if (url) {
      if (_.isEmpty(formChangedValues)) {
        return
      }
      if (!rowKey) {
        console.error('请配置 rowKey')
        return
      }
      if (callHook(this.props.beforeSave, newValues => (formChangedValues = newValues), formChangedValues, rawFormRecord) === false) {
        return
      }
      if (callHook(this.props.beforeCreate, newValues => (formChangedValues = newValues), formChangedValues, rawFormRecord) === false) {
        return
      }
      const ret = await autoFetch(url, formChangedValues)
      if (_.isFunction(callback)) {
        callback(ret)
      }
    } else {
      console.error('请配置 onCreate 或 createUrl ')
    }
  }

  async handleUpdate (callback) {
    const rowKey = this.getPropValue('rowKey')
    const url = this.getPropValue('updateUrl')
    const { rawFormRecord, formRecord, formChangedValues } = this.state
    if (_.isFunction(this.props.onUpdate)) {
      this.props.onUpdate(formChangedValues, formRecord)
    } else if (url) {
      if (_.isEmpty(formChangedValues)) {
        return
      }
      if (!rowKey) {
        console.error('请配置 rowKey')
        return
      }
      let body = {
        cond: {
          [rowKey]: formRecord[rowKey]
        },
        doc: formChangedValues
      }
      if (callHook(this.props.beforeSave, newValues => (body = newValues), body, rawFormRecord) === false) {
        return
      }
      if (callHook(this.props.beforeUpdate, newValues => (body = newValues), body, rawFormRecord) === false) {
        return
      }
      const ret = await autoFetch(url, body)
      if (_.isFunction(callback)) {
        callback(ret)
      }
    } else {
      console.error('请配置 onUpdate 或 updateUrl ')
    }
  }

  async handleDelete (callback, record) {
    const rowKey = this.getPropValue('rowKey')
    const url = this.getPropValue('deleteUrl')
    const { selectedRowKeys = [], selectedRows = [], rawFormRecord } = this.state
    // 处理行删除
    if (!_.isEmpty(record)) {
      selectedRowKeys.push(record[rowKey])
      selectedRows.push(record)
    }
    if (_.isEmpty(selectedRowKeys)) {
      message.error(this.props.L('fano_table_del_selectrows', 'Please select the rows you want to delete'))
      return
    }
    if (_.isFunction(this.props.onDelete)) {
      this.props.onDelete(selectedRowKeys, selectedRows)
    } else if (url) {
      if (!rowKey) {
        console.error('请配置 rowKey')
        return
      }
      let body = {
        cond: {
          [rowKey]:
            selectedRowKeys.length === 1
              ? selectedRowKeys[0]
              : { $in: selectedRowKeys }
        },
        multi: selectedRowKeys.length > 1
      }
      if (callHook(this.props.beforeDelete, newValues => (body = newValues), body, rawFormRecord) === false) {
        return
      }
      await autoFetch(url, body)
      if (_.isFunction(callback)) {
        callback()
      }
      this.setState({ selectedRowKeys: undefined, selectedRows: undefined })
    } else {
      console.error('请配置 onDelete 或 deleteUrl ')
    }
  }

  deleteWrapper (children, rowDel, record) {
    const onClick = async () => {
      const callback = () => {
        this.handleRefresh(true)
      }
      if (rowDel) {
        await this.handleDelete(callback, record)
      } else {
        await this.handleDelete(callback)
      }
    }
    return _.isEmpty(this.state.selectedRowKeys) && !rowDel ? (
      <span onClick={onClick}>{children}</span>
    ) : (
      <Popconfirm
        title={this.props.L('fano_table_del_popconfirm', 'Are you sure to delete?')}
        placement='bottomLeft'
        onClick={e => e.stopPropagation()}
        onConfirm={onClick}
        onCancel={e => e.stopPropagation()}
      >
        {children}
      </Popconfirm>
    )
  }

  renderColumns () {
    // 表格列需求：
    // 1. 隐藏/显示操作按钮：指定show字段
    // 2. 覆盖默认按钮配置：指定属性
    // 3. 按钮排序：指定sort
    // 4. 增加新按钮
    const rowActions = _.chain([
      {
        key: 'edit',
        icon: 'edit',
        sort: 100,
        onClick: record => {
          this.toggleDrawerVisible()
        },
        text: this.props.L('fano_table_row_action_edit_text', 'Edit'),
        show: this.getPropValue('editable')
      },
      {
        key: 'del',
        icon: 'delete',
        type: 'danger',
        sort: 200,
        text: this.props.L('fano_table_row_action_del_text', 'Delete'),
        wrapper: (children, record) => this.deleteWrapper(children, true, record),
        show: this.getPropValue('deleteable')
      },
      ...(this.props.rowActions || [])
    ])
      .map((o, index) => {
        let eachRAP = _.get(
          this.props.fillRowActionsProps || this.props.fillRAP,
          o.id || o.key || index
        )
        if (eachRAP !== undefined) {
          if (_.isFunction(eachRAP)) {
            const ret = eachRAP(o)
            if (ret) {
              eachRAP = ret
            }
          } else if (_.isBoolean(eachRAP)) {
            eachRAP = { show: eachRAP }
          }
        }
        const config = {
          ...o,
          ...eachRAP
        }
        if (_.isFunction(config.onClick)) {
          const { onClick } = config
          config.onClick = (record, index) => {
            this.handleFormRecord(record, false, null, () => {
              onClick(record, index)
            })
          }
        }
        return config
      })
      // 函数类型的将由 renderRowActions 进行控制
      .filter(o => _.isFunction(o.show) || _.get(o, 'show', true))
      .sortBy('sort')
      .value()
    const defaultActionsColumn = _.merge({
      title: this.props.L('fano_table_cols_actions', 'Actions'),
      dataIndex: 'actions',
      key: 'actions',
      width: 200,
      render: (_, record, index) => renderRowActions(rowActions, record, index)
    }, this.props.actionsProps)
    if (this.props.actionsWidth) {
      defaultActionsColumn.width = this.props.actionsWidth
    }
    let columns = [...this.props.columns]
    if (!_.isEmpty(rowActions) && this.props.hideActions !== true) {
      columns.push(defaultActionsColumn)
    }
    const sortMap = _.chain(this.state.sort || [])
      .groupBy('key')
      .mapValues(values => _.head(values))
      .value()
    columns = columns.map(item => {
      _.merge(item, _.get(this.props.fillColsProps, item.dataIndex))
      item.key = item.key || item.dataIndex
      item.ellipsis = _.get(item, 'ellipsis', true)
      if (item.sorter) {
        const sortType = _.get(sortMap, `${item.dataIndex}.type`)
        const sortOrder = { asc: 'ascend', desc: 'descend' }[sortType]
        if (_.isString(sortOrder)) {
          item.sortOrder = sortOrder
        } else {
          item.sortOrder = false
        }
      }
      if (_.isString(item.render)) {
        let unmatchedDefaultRender = true
        const raw = item.render // Example: fromNow,YYYY-MM-DD HH:mm:ss
        for (const key in defaultRenders) {
          if (raw.startsWith(key)) {
            const defaultRender = defaultRenders[key]
            if (_.isFunction(defaultRender)) {
              unmatchedDefaultRender = false
              item.render = (text, record) => {
                let children = defaultRender(text, record, raw.replace(new RegExp(`^${key},?`), ''))
                if (item.tooltip) {
                  if (_.isFunction(item.tooltip)) {
                    children = <Tooltip {...item.tooltip(text, record)}>{children}</Tooltip>
                  } else {
                    children = <Tooltip title={item.tooltip}>{children}</Tooltip>
                  }
                }
                return children
              }
            }
            break
          }
        }
        if (unmatchedDefaultRender) {
          console.warn(`Warning: unmatched default render(${item.render})`)
          delete item.render
        }
      }
      return item
    })
    return columns
  }

  getPropValue (key) {
    let importUrl
    let form = this.props.form
    switch (key) {
      case 'rowKey':
        return this.props.rowKey || 'ID'
      case 'listUrl':
        return (
          this.props.listUrl ||
          (this.props.url ? `GET ${this.props.url}` : undefined)
        )
      case 'createUrl':
        return (
          this.props.createUrl ||
          (this.props.url ? `POST ${this.props.url}` : undefined)
        )
      case 'updateUrl':
        return (
          this.props.updateUrl ||
          (this.props.url ? `PUT ${this.props.url}` : undefined)
        )
      case 'deleteUrl':
        return (
          this.props.deleteUrl ||
          (this.props.url ? `DELETE ${this.props.url}` : undefined)
        )
      case 'importUrl':
        if (this.props.importUrl) {
          importUrl = this.props.importUrl
        } else {
          importUrl = 'POST /import'
        }
        importUrl = _.get(parseAutoUrl(importUrl), 'url')
        importUrl = withPrefix(importUrl)
        return importUrl
      case 'form':
        if (form) {
          form = form.map(item => {
            if (_.isEmpty(item.label)) {
              return { ...item, label: _.get(this.columnsMap, `${item.name}.title`) }
            }
            return item
          })
        }
        return form
      case 'addable':
        return _.isBoolean(this.props.addable) || _.isFunction(this.props.addable) ? this.props.addable : true
      case 'editable':
        return _.isBoolean(this.props.editable) || _.isFunction(this.props.editable) ? this.props.editable : true
      case 'deleteable':
        return _.isBoolean(this.props.deleteable) || _.isFunction(this.props.deleteable) ? this.props.deleteable : true
    }
  }

  getRecordDisabled (record) {
    let disabled
    if (!_.isEmpty(record)) {
      const { disabledRow } = this.props
      if (_.isFunction(disabledRow)) {
        disabled = disabledRow(record)
      } else if (_.isString(disabledRow)) {
        disabled = record[disabledRow]
      }
    }
    disabled = _.isBoolean(disabled) ? disabled : false
    return disabled
  }

  getDefaultColumnWidth () {
    return (this.props.defaultColumnWidth === undefined ? 150 : this.props.defaultColumnWidth || 0)
  }

  async handleFormRecord (record, selectedRow = true, newState, callback) {
    const rowClickSelected = _.get(this.props, 'rowClickSelected', true)
    let formRecord = { ...record }
    if (_.isFunction(this.props.onFormRecord)) {
      const ret = await this.props.onFormRecord(formRecord)
      if (ret !== undefined) {
        formRecord = ret
      }
    }
    const state = { rawFormRecord: record, formRecord, formChangedValues: undefined }
    // 处理行点击选中
    if (rowClickSelected && !this.state.drawerVisible && selectedRow) {
      _.assign(state, this.handleRowSelected(record, false))
    }
    this.setState(_.assign(state, newState), callback)
  }

  getFilterDefaultOperator (name) {
    if (!name) {
      return 'eq'
    }

    return _.get((this.filterFieldsMap || {})[name], 'operators[0].value', 'eq')
  }

  handleSortChange (key, item) {
    const { sort } = this.state
    for (const o of sort) {
      if (o.key === key) {
        Object.assign(o, item)
        this.setState({ sort: [...sort] })
        return
      }
    }
  }

  handleCondChange (key, item) {
    const { cond } = this.state
    for (const o of cond) {
      if (o.key === key) {
        Object.assign(o, item)
        this.setState({ cond: [...cond], resetCurrentPage: true })
        return
      }
    }
  }

  handleCondAddRule () {
    const { cond } = this.state
    const name = _.get(this.filterFields, '[0].name')

    if (!name) {
      return
    }

    const op = this.getFilterDefaultOperator(name)
    cond.push({
      key: `${Math.random()}`.substr(2),
      name,
      op
    })
    this.setState({ cond: [...cond] })
  }

  getCacheInvisibleColsKey () {
    return md5(window.encodeURIComponent(this.props.name + window.location.pathname + window.location.hash))
  }

  cacheInvisibleCols (invisibleCols) {
    invisibleCols = _.isEmpty(invisibleCols) ? {} : invisibleCols
    const hashedKey = this.getCacheInvisibleColsKey()
    window.localStorage.setItem(hashedKey, JSON.stringify(invisibleCols))
  }

  renderFilterOperators (item) {
    // item.name可能包含点‘.’
    const filterOperators = _.get((this.filterFieldsMap || {})[item.name], 'operators')
    const options = []
    for (const item of filterOperators) {
      if (item.value && item.label) {
        options.push(
          <Select.Option key={item.value} value={item.value}>
            {item.label}
          </Select.Option>
        )
      }
    }
    return options
  }

  renderFilterControl (item) {
    // item.name可能包含点‘.’
    const filterRender = _.get((this.filterFieldsMap || {})[item.name], 'render')
    const formConfig = (this.formItemsMap || {})[item.name]

    if (_.isFunction(filterRender)) {
      return filterRender(item.value, value => this.handleCondChange(item.key, { value }), item)
    } else if (formConfig) {
      const FanoComponent = _.get(types, formConfig.type)
      const fanoConfig = { props: { ...formConfig.props } }
      if (FanoComponent) {
        return (
          <FanoComponent
            value={item.value}
            onChange={value => this.handleCondChange(item.key, { value })}
            config={fanoConfig}
          />
        )
      }
    }
    return (
      <Input
        value={item.value}
        disabled={['null', 'notnull'].includes(item.op)}
        onChange={e => this.handleCondChange(item.key, { value: e.target.value })}
      />
    )
  }

  resetSearchForm () {
    this.searchForm.current.reset(() => {
      if (_.isFunction(this.props.onFilterReset)) {
        this.props.onFilterReset()
      }
      this.setState({ cond: [], resetCurrentPage: true })
      this.handleRefresh()
    })
  }

  getSearchFormValue (fieldNames) {
    return this.searchForm.current ? this.searchForm.current.getFieldsValue(fieldNames) : undefined
  }

  setSearchFormValue (newValues, all) {
    if (this.searchForm.current) {
      this.searchForm.current.setFieldsValue(newValues, all)
    }
  }

  renderSearchForm () {
    if (_.isEmpty(this.state.filterFields)) {
      return null
    }
    if (_.isFunction(this.props.renderSearchForm)) {
      return this.props.renderSearchForm()
    }
    const { cond, searchCollapsed } = this.state
    let config = [...this.state.filterFields].filter(item => {
      let show = _.get(item, 'show', true)
      if (_.isFunction(show)) {
        show = show(cond, searchCollapsed)
      }
      return !!show
    }).map(item => {
      item.type = item.type || 'input'
      let rules = _.get(item, 'props.fieldOptions.rules')
      if (!_.isEmpty(rules)) {
        rules = rules.map(rule => {
          rule.required = false
          return rule
        })
        _.set(item, 'props.fieldOptions.rules', rules)
        if (['input', 'number', 'textarea', 'select', 'treeselect', 'datepicker', 'rangepicker', 'monthpicker', 'weekpicker', 'timepicker'].includes(item.type)) {
          _.set(item, 'props.allowClear', true)
        }
      }
      if (_.isFunction(item.render)) {
        item.type = 'render'
        _.set(item, 'props.render', props => item.render(props.value, props.onChange))
      }
      return item
    })
    const value = {}
    for (const item of cond) {
      value[item.name] = item.value
    }
    if (!_.isEmpty(this.props.filterSimpleNames) && searchCollapsed) {
      config = config.filter(item => this.props.filterSimpleNames.includes(item.name))
    }
    let layout = {
      xs: 24,
      sm: 24,
      md: 12,
      lg: 8,
      xl: 8,
      xxl: 8
    }
    if (_.isNumber(this.props.filterFormCols) && _.isFinite(this.props.filterFormCols)) {
      layout = getResponsivePropsByColumns(this.props.filterFormCols, layout)
    }
    return (
      <FanoForm
        {..._.get(this.props, 'filterFormProps', {})}
        ref={this.searchForm}
        config={config}
        bottomClassName='fano-table-search-actions'
        value={value}
        layout={layout}
        renderBottom={props => {
          return (
            <Row justify='end'>
              <Col
                span={24}
                style={{ textAlign: 'right', marginBottom: 15 }}
              >
                <Button
                  style={{ display: _.isEmpty(this.props.filterSimpleNames) ? 'none' : 'inline-block' }}
                  type='link'
                  onClick={() => {
                    this.setState({ searchCollapsed: !searchCollapsed })
                  }}
                >
                  {searchCollapsed
                    ? <span><Icon type='down' style={{ fontSize: 14 }} /> {props.L('fano_table_more', 'More')}</span>
                    : <span><Icon type='up' style={{ fontSize: 14 }} /> {props.L('fano_table_less', 'Less')}</span>}
                </Button>
                <Button
                  type='primary'
                  htmlType='submit'
                  loading={props.loading}
                >
                  {props.L('fano_table_search', 'Search')}
                </Button>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => this.resetSearchForm()}
                >
                  {props.L('fano_table_reset', 'Reset')}
                </Button>
              </Col>
            </Row>
          )
        }}
        onSubmit={err => {
          if (err) {
            return
          }
          this.handleRefresh()
        }}
        onValuesChange={this.props.onFilterValuesChange}
        onFieldsChange={this.props.onFormFieldsChange}
        onChange={(changedValues, allValues) => {
          this.setState({
            cond: this.getFilterCondByValue({ ...changedValues }),
            resetCurrentPage: true
          })
        }}
      />
    )
  }

  getFilterCondByValue (values) {
    let cond = this.state.cond || []
    const existsKeys = []
    for (const item of cond) {
      if (_.has(values, item.name)) {
        item.value = _.get(values, item.name) // 可能存在包含“.”的字段，antd form会自动转成嵌套对象
        existsKeys.push(item.name)
      }
    }
    const diff = _.differenceBy(_.keys(this.filterFieldsMap), existsKeys)
    for (const name of diff) {
      if (_.has(values, name)) {
        const conf = this.filterFieldsMap[name] || {}
        let op = conf.formOperator || _.get(conf, 'operators[0]', 'eq')
        op = _.get(op, 'value', op)
        op = _.isString(op) ? op : 'eq'
        cond.push({
          key: `${Math.random()}`.substr(2),
          name: name,
          op,
          value: _.get(values, name)
        })
      }
    }
    cond = cond.filter(item => !['', null, undefined].includes(item.value))
    return cond
  }

  render () {
    const { props } = this
    const rowClickSelected = _.get(props, 'rowClickSelected', true)
    const {
      invisibleCols,
      sort,
      cond,
      condtype
    } = this.state
    const sortGroupBy = _.groupBy(sort, 'key')
    const columns = this.renderColumns()
    const visibleColumns = columns.filter(o => !!_.get(invisibleCols, o.dataIndex, true))
    const dataSource = this.getDataSource()
    // 处理pagination
    let pagination = { ...this.state.pagination }
    if (props.pagination !== false) {
      _.set(pagination, 'showTotal', total => props.L('fano_table_total', 'Total {{total}} items', { total }))
      if (!_.isEmpty(props.pagination)) {
        _.merge(pagination, props.pagination)
      }
      const dataSize = _.size(dataSource)
      if (pagination.total === 0 && dataSize !== 0) {
        _.set(pagination, 'total', dataSize)
      }
    } else {
      pagination = false
    }
    const defaultProps = {
      size: 'small',
      rowKey: this.getPropValue('rowKey')
    }
    const fanoProps = {
      loading: false,
      columns: visibleColumns,
      dataSource,
      pagination,
      rowSelection: rowClickSelected
        ? _.merge(
          {
            columnWidth: 40,
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ selectedRowKeys, selectedRows })
              callHook(this.props.onRowSelectionChange, null, selectedRowKeys, selectedRows)
            }
          },
          this.props.rowSelection
        )
        : this.props.rowSelection,
      onRow: record => {
        return {
          onClick: e => {
            if (rowClickSelected) {
              e.stopPropagation()
              this.handleRowSelected(record)
            }
          },
          onDoubleClick: e => {
            e.stopPropagation()
            const state = {}
            let rowClickToggleDrawer = _.get(props, 'rowClickToggleDrawer', true)
            if (_.isFunction(rowClickToggleDrawer)) {
              rowClickToggleDrawer = rowClickToggleDrawer(record)
            }
            if (rowClickToggleDrawer) {
              state.drawerVisible = true
            }
            this.handleFormRecord(record, false, state)
          }
        }
      },
      onChange: (pagination, filters, sorter) => {
        let sort = this.state.sort
        const type = { ascend: 'asc', descend: 'desc' }[sorter.order]
        if (type) {
          // NOTE: Ant Design只支持单列排序
          // const index = _.findIndex(sort, item => item.key === sorter.columnKey)
          // if (index >= 0) {
          //   sort[index].type = type
          // } else {
          //   sort.push({
          //     key: sorter.columnKey,
          //     type
          //   })
          // }
          sort = [{
            key: sorter.columnKey,
            type
          }]
        } else {
          sort = sort.filter(item => item.key !== sorter.columnKey)
        }
        this.setState({ sort }, this.handleRefresh)
      }
    }
    if (this.props.disabledRow) {
      const raw = _.get(fanoProps, 'rowSelection.getCheckboxProps')
      _.set(fanoProps, 'rowSelection.getCheckboxProps', record => {
        const ret = _.isFunction(raw) ? raw(record) : {}
        ret.disabled = this.getRecordDisabled(record)
        return ret
      })
    }
    if (this.props.expandAllRows) {
      fanoProps.expandedRowKeys = this.state.expandedRowKeys || []
      fanoProps.onExpand = (expanded, record) => {
        let { expandedRowKeys } = this.state
        if (expanded) {
          expandedRowKeys.push(record.ID)
        } else {
          expandedRowKeys = expandedRowKeys.filter(item => item !== record.ID)
        }
        this.setState({ expandedRowKeys: [...expandedRowKeys] })
      }
    }
    const tableActions = _.chain([
      {
        key: 'add',
        icon: 'plus',
        text: this.props.L('fano_table_actions_add', 'Add'),
        type: 'primary',
        sort: 100,
        show: this.getPropValue('addable'),
        onClick: e => {
          this.handleAdd()
        }
      },
      {
        key: 'del',
        icon: 'minus',
        text: this.props.L('fano_table_actions_del', 'Del'),
        type: 'danger',
        sort: 200,
        show: () => {
          const can = this.getPropValue('deleteable')
          return _.isFunction(can) ? can(this.state.selectedRowKeys, this.state.selectedRows) : can
        },
        wrapper: this.deleteWrapper
      },
      {
        key: 'cols',
        icon: 'eye-invisible',
        text: this.props.L('fano_table_actions_cols', 'Columns'),
        sort: 300,
        wrapper: children => {
          const allKeys = _.chain(columns).groupBy('dataIndex').keys().value()
          const selectKeys = _.keys(invisibleCols).filter(item => allKeys.includes(item) && invisibleCols[item] === true)
          return (
            <Popover
              placement='bottomLeft'
              trigger='click'
              content={
                <div className='fano-table-cols-invisible'>
                  <List
                    size='small'
                    dataSource={[
                      {
                        dataIndex: 'all',
                        title: `${this.props.L('fano_table_select_all', 'Select All')}/${this.props.L('fano_table_deselect_all', 'Deselect All')}`
                      },
                      ...columns
                    ]}
                    renderItem={item => (
                      <List.Item
                        actions={[
                          <Checkbox
                            key='select'
                            checked={!!_.get(invisibleCols, item.dataIndex, true)}
                            indeterminate={item.dataIndex === 'all' ? (_.size(selectKeys) > 0 && _.size(selectKeys) !== _.size(allKeys)) : false}
                            onChange={e => {
                              _.set(
                                invisibleCols,
                                item.dataIndex,
                                e.target.checked
                              )
                              invisibleCols[item.dataIndex] = e.target.checked
                              if (item.dataIndex === 'all') {
                                const vs = _.chain(columns).groupBy('dataIndex').mapValues(_ => e.target.checked).value()
                                Object.assign(invisibleCols, vs)
                              }
                              this.setState({
                                invisibleCols: { ...invisibleCols }
                              }, () => this.cacheInvisibleCols(this.state.invisibleCols))
                            }}
                          />
                        ]}
                      >
                        {item.title}
                      </List.Item>
                    )}
                  />
                </div>
              }
            >
              {children}
            </Popover>
          )
        }
      },
      {
        key: 'filter',
        icon: 'filter',
        badge: _.size(cond),
        text: this.props.L('fano_table_actions_filter', 'Filter'),
        sort: 400,
        show: false,
        wrapper: children => {
          // 查询需求：
          // 1. URL后允许配置默认搜索条件：cond={}
          // 2. 用户可在界面新增搜索条件
          // 3. 所有搜索条件要在界面可视化
          // 4. 可全局设置逻辑规则：
          //   a) 满足所有条件：$and
          //   b) 满足任一条件：$or
          return (
            <Popover
              placement='bottomLeft'
              trigger='click'
              visible={this.state.filterPopoverVisible}
              onVisibleChange={this.handleFilterPopoverVisibleChange}
              content={
                <div className='fano-table-filter'>
                  <div className='fano-table-filter-condtype'>
                    <span>{this.props.L('fano_table_filter_condtype_before', 'Query data that meets')}</span>
                    <Select
                      value={condtype}
                      onChange={value => {
                        this.setState({ condtype: value })
                      }}
                    >
                      <Select.Option value='and'>{this.props.L('fano_table_filter_condtype_all', 'ALL')}</Select.Option>
                      <Select.Option value='or'>{this.props.L('fano_table_filter_condtype_one', 'ONE')}</Select.Option>
                    </Select>
                    <span>{this.props.L('fano_table_filter_condtype_after', 'of the following rules')}</span>
                  </div>
                  <List
                    size='small'
                    dataSource={cond}
                    style={{ display: _.isEmpty(cond) ? 'none' : 'block' }}
                    renderItem={item => {
                      return (
                        <List.Item
                          actions={[
                            <Tooltip
                              key='del_rule'
                              title={this.props.L('fano_table_filter_delrule', 'Delete this rule')}
                            >
                              <Icon
                                className='fano-table-filter-del'
                                type='minus-circle'
                                theme='filled'
                                onClick={() => {
                                  this.setState({
                                    cond: cond.filter(o => o.key !== item.key)
                                  })
                                }}
                              />
                            </Tooltip>
                          ]}
                        >
                          <Input.Group className='fano-table-filter-rule' compact>
                            <Select
                              value={item.name}
                              className='fano-table-filter__columns'
                              onChange={value => this.handleCondChange(item.key, {
                                name: value,
                                op: this.getFilterDefaultOperator(value),
                                value: undefined
                              })}
                            >
                              {this.filterFields.map(field => (
                                <Select.Option
                                  key={field.name}
                                  value={field.name}
                                >
                                  {field.label}
                                </Select.Option>
                              ))}
                            </Select>
                            <Select
                              value={item.op}
                              className='fano-table-filter__op'
                              onChange={value => this.handleCondChange(item.key, { op: value })}
                            >
                              {this.renderFilterOperators(item)}
                            </Select>
                            <div className='fano-table-filter__ctrl'>
                              {this.renderFilterControl(item)}
                            </div>
                          </Input.Group>
                        </List.Item>
                      )
                    }}
                  />
                  {!_.isEmpty(this.filterFields) && (
                    <Button
                      className='fano-table-filter-add'
                      type='link'
                      size='small'
                      onClick={this.handleCondAddRule}
                    >
                      <Icon type='plus-circle' theme='filled' />
                      {this.props.L('fano_table_filter_addrule', 'Add rule')}
                    </Button>
                  )}
                  <div className='fano-table-filter-actions'>
                    <Button
                      type='primary' onClick={this.handleRefresh}
                    >
                      {this.props.L('fano_table_filter_submit', 'Filter now')}
                    </Button>
                  </div>
                </div>
              }
            >
              {children}
            </Popover>
          )
        }
      },
      {
        key: 'sort',
        icon: 'sort-ascending',
        text: this.props.L('fano_table_actions_sort', 'Sort'),
        badge: _.size(sort),
        sort: 500,
        show: false,
        wrapper: children => {
          // 排序需求：
          // 1. URL后允许配置默认排序值：sort=xxx,xxx
          // 2. 用户可在界面新增排序条件
          // 3. 所有排序条件要在界面可视化
          // 4. 可拖动调整排序优先级
          return (
            <Popover
              placement='bottomLeft'
              trigger='click'
              visible={this.state.sortPopoverVisible}
              onVisibleChange={this.handleSortPopoverVisibleChange}
              content={
                <div className='fano-table-sort'>
                  <List
                    size='small'
                    dataSource={sort}
                    style={{ display: _.isEmpty(sort) ? 'none' : 'block' }}
                    renderItem={item => {
                      const sortColumns = columns.filter(
                        col =>
                          _.isEmpty(sortGroupBy[col.dataIndex]) ||
                            col.dataIndex === item.key
                      )
                      return (
                        <List.Item
                          actions={[
                            <Tooltip key='del_rule' title={this.props.L('fano_table_sort_delrule', 'Delete this rule')}>
                              <Icon
                                className='fano-table-sort-del'
                                type='minus-circle'
                                theme='filled'
                                onClick={() => {
                                  this.setState({
                                    sort: sort.filter(o => o.key !== item.key)
                                  })
                                }}
                              />
                            </Tooltip>
                          ]}
                        >
                          <Input.Group compact>
                            <Select
                              value={item.key}
                              style={{ width: 120 }}
                              onChange={value => this.handleSortChange(item.key, { key: value })}
                            >
                              {sortColumns.filter(col => !['actions'].includes(col.dataIndex)).map(col => (
                                <Select.Option
                                  key={col.dataIndex}
                                  value={col.dataIndex}
                                >
                                  {col.title}
                                </Select.Option>
                              ))}
                            </Select>
                            <Select
                              value={item.type}
                              style={{ width: 120 }}
                              onChange={value => this.handleSortChange(item.key, { type: value })}
                            >
                              <Select.Option value='asc'>
                                {this.props.L('fano_table_sort_asc', 'Ascending')}
                              </Select.Option>
                              <Select.Option value='desc'>
                                {this.props.L('fano_table_sort_desc', 'Descending')}
                              </Select.Option>
                            </Select>
                          </Input.Group>
                        </List.Item>
                      )
                    }}
                  />
                  <Button
                    className='fano-table-sort-add'
                    type='link'
                    size='small'
                    onClick={() => {
                      for (const col of columns) {
                        if (_.isEmpty(sortGroupBy[col.dataIndex])) {
                          sort.push({ key: col.dataIndex, type: 'asc' })
                          this.setState({ sort: [...sort] })
                          return
                        }
                      }
                    }}
                  >
                    <Icon type='plus-circle' theme='filled' />
                    {this.props.L('fano_table_sort_addrule', 'Add rule')}
                  </Button>
                  <div className='fano-table-sort-actions'>
                    <Button
                      type='primary' onClick={this.handleRefresh}
                    >
                      {this.props.L('fano_table_sort_submit', 'Sort now')}
                    </Button>
                  </div>
                </div>
              }
            >
              {children}
            </Popover>
          )
        }
      },
      {
        key: 'import',
        icon: 'import',
        text: this.props.L('fano_table_actions_import', 'Import'),
        sort: 600,
        show: !!(this.props.importUrl || this.props.importChannel),
        wrapper: children => {
          const props = _.merge({
            name: 'file',
            action: this.getPropValue('importUrl'),
            accept: '.xls,.xlsx,application/*',
            showUploadList: false,
            data: { channel: _.get(this.props, 'importChannel') },
            onChange: info => {
              if (info.file.status === 'done') {
                if (_.get(info.file, 'response.code') === 0) {
                  this.handleRefresh()
                } else if (_.get(info.file, 'response.msg')) {
                  message.error(_.get(info.file, 'response.msg'))
                }
              } else if (info.file.status === 'error') {
                message.error(this.props.L('rest_import_failed', 'Import failed'))
              }
            }
          }, this.props.importProps)
          if (!_.isFunction(props.onChange)) {
            delete props.onChange
          }
          return (
            <Upload {...props}>{children}</Upload>
          )
        }
      },
      {
        key: 'export',
        icon: 'export',
        text: this.props.L('fano_table_actions_export', 'Export'),
        sort: 700,
        show: true,
        onClick: () => {
          let data = dataSource
          if (!_.isEmpty(this.state.selectedRowKeys)) {
            const rowKey = this.getPropValue('rowKey')
            data = dataSource.filter(item => this.state.selectedRowKeys.includes(item[rowKey]))
          }
          if (_.isFunction(this.props.onExport)) {
            this.props.onExport({
              columns: visibleColumns,
              data,
              query: this.getListQuery(),
              fileName: this.props.exportFileName
            })
          } else {
            exportTable(visibleColumns, data, this.props.exportFileName)
          }
        }
      },
      {
        key: 'sync',
        icon: 'sync',
        text: this.props.L('fano_table_actions_refresh', 'Refresh'),
        sort: 800,
        onClick: () => this.handleRefresh(true)
      },
      {
        key: 'expand',
        icon: 'column-height',
        text: this.props.L('fano_table_actions_expand', 'Expand All'),
        show: _.has(this.props, 'expandAllRows'),
        sort: 900,
        onClick: e => {
          this.setState({
            expandedRowKeys: this.state.expandedRawAllKeys
          })
        }
      },
      {
        key: 'collapse',
        icon: 'vertical-align-middle',
        text: this.props.L('fano_table_actions_collapse', 'Collapse All'),
        show: _.has(this.props, 'expandAllRows'),
        sort: 1000,
        onClick: e => {
          this.setState({
            expandedRowKeys: []
          })
        }
      },
      ...(this.props.tableActions || [])
    ])
      .map((o, index) => {
        // 如果不包含任何可过滤字段，强制不显示过滤按钮
        // 但也支持覆盖show，因为onClick可被覆盖
        if (o.key === 'filter' && _.isEmpty(this.filterFields)) {
          o.show = false
        }
        let eachTAP = _.get(
          this.props.fillTableActionsProps || this.props.fillTAP,
          o.id || o.key || index
        )
        let config = o
        if (eachTAP !== undefined) {
          if (_.isFunction(eachTAP)) {
            const ret = eachTAP(o)
            if (ret) {
              eachTAP = ret
            }
          } else if (_.isBoolean(eachTAP)) {
            eachTAP = { show: eachTAP }
          }
          config = {
            ...o,
            ...eachTAP
          }
        }
        return config
      })
      .filter(o => _.result(o, 'show', true))
      .sortBy('sort')
      .value()
    let tabs = this.isEdit(this.state.formRecord) ? _.get(props, 'tabs', []) : []
    const tabsContext = {
      value: this.state.formRecord,
      disabled: this.getRecordDisabled(this.state.formRecord)
    }
    const form = this.getPropValue('form')
    if (form) {
      const formProps = _.get(props, 'formProps', {})
      if (props.formBottom !== undefined) {
        if (_.isFunction(props.formBottom)) {
          _.set(formProps, 'renderBottom', props.formBottom)
        } else {
          _.set(formProps, 'bottom', props.formBottom)
        }
      }
      if (this.isEdit(tabsContext.value)) {
        let editable = this.getPropValue('editable')
        if (_.isFunction(editable)) {
          editable = editable(tabsContext.value)
        }
        if (!editable) {
          _.set(formProps, 'bottom', null)
        }
      } else {
        let addable = this.getPropValue('addable')
        if (_.isFunction(addable)) {
          addable = addable()
        }
        if (!addable) {
          _.set(formProps, 'bottom', null)
        }
      }
      if (!formProps.formLayout) {
        formProps.formLayout = 'vertical'
      }
      if (_.isEmpty(formProps.layout)) {
        formProps.layout = this.state.drawerFullScreen ? getResponsivePropsByColumns(3) : getResponsivePropsByColumns(1)
      }
      tabs = [{
        tab: this.props.L('fano_table_tabs_form', 'Form'),
        key: 'form',
        children: (
          <div className='fano-table-detail'>
            <FanoForm
              {...tabsContext}
              {...formProps}
              ref={this.form}
              config={form || {}}
              onSubmit={this.handleSiderSave}
              onCancel={this.handleDrawerClose}
              bottomClassName='fano-table-detail-actions'
              onValuesChange={this.props.onFormValuesChange}
              onFieldsChange={this.props.onFormFieldsChange}
              onChange={(changedValues, allValues) => {
                this.setState({
                  formChangedValues: _.assign(
                    this.state.formChangedValues,
                    changedValues
                  ),
                  formRecord: allValues
                })
              }}
            />
          </div>
        )
      }, ...(tabs || [])]
    }
    if (_.isArray(this.state.showTabKeys) && !_.isEmpty(this.state.showTabKeys)) {
      tabs = tabs.filter(tab => this.state.showTabKeys.includes(tab.key))
    }
    const finalTableProps = _.assign(_.merge(
      defaultProps,
      _.omit(props, ['form', 'formProps', 'width', 'height', 'className', 'style', 'exportFileName', 'onExport'])
    ), fanoProps)
    if (!props.width) {
      _.set(finalTableProps, 'style.minWidth', _.sumBy(fanoProps.columns, item => item.width || this.getDefaultColumnWidth()))
    }
    if (!_.isEmpty(finalTableProps.scroll)) {
      for (const column of finalTableProps.columns) {
        if (column.dataIndex !== 'actions') {
          column.width = column.width || this.getDefaultColumnWidth()
        }
      }
    }
    if (props.height) {
      _.set(finalTableProps, 'style.height', props.height)
    }
    const searchForm = this.renderSearchForm()
    const defaultClassNames = `fano-table ${this.props.hideTableActions ? 'fano-table-hide-actions' : ''}`
    return (
      <Spin spinning={this.state.listLoading}>
        <div
          className={props.className ? `${props.className} ${defaultClassNames}` : defaultClassNames}
          style={props.style}
          onKeyDown={e => {
            this.setState({ closeDrawerAfterSave: e.altKey })
          }}
          onKeyUp={e => {
            this.setState({ closeDrawerAfterSave: e.altKey })
          }}
        >
          <div className={`fano-table-header ${this.props.hideTableActions ? 'fano-table-header-hide' : ''}`}>
            {renderTableActions(tableActions)}
          </div>
          <div
            className='fano-table-search'
            style={{ display: _.get(this.props, 'filterForm', true) && searchForm ? 'block' : 'none' }}
          >
            {searchForm}
          </div>
          <div className='fano-table-content'>
            <div
              className={`fano-table-main ${
                _.get(props, 'fitHeight', true) ? 'fano-table-fit-height' : ''
              }`}
            >
              <div className='fano-table-wrapper'>
                {_.isFunction(this.props.renderTable) ? this.props.renderTable(finalTableProps, props) : (
                  <Table
                    {...finalTableProps}
                  />
                )}
              </div>
              <div className='fano-table-pagination'>
                {pagination && <Pagination {...pagination} size={finalTableProps.size} />}
              </div>
            </div>
            <Drawer
              width={this.state.drawerFullScreen ? '100vw' : this.props.drawerWidth || 700}
              closable={false}
              destroyOnClose
              onClose={this.handleDrawerClose}
              visible={this.state.drawerVisible}
              className='fano-table-sider'
            >
              <Tabs
                defaultActiveKey='detail'
                type='card'
                tabBarExtraContent={
                  <Button.Group>
                    <Tooltip placement='bottom' title={this.props.L('fano_table_tabs_fullscreen', 'Full Screen')}>
                      <Button
                        type='link'
                        icon={this.state.drawerFullScreen ? 'fullscreen-exit' : 'fullscreen'}
                        onClick={() => {
                          this.setState({ drawerFullScreen: !this.state.drawerFullScreen })
                        }}
                      />
                    </Tooltip>
                    <Tooltip placement='bottom' title={this.props.L('fano_table_tabs_close', 'Close')}>
                      <Button
                        type='link'
                        icon='close'
                        onClick={this.handleDrawerClose}
                      />
                    </Tooltip>
                  </Button.Group>
                }
              >
                {tabs
                  .filter(item => (_.isFunction(item.show) && item.show(tabsContext.value)) || _.get(item, 'show', true))
                  .map(item => {
                    let children = item.children
                    if (_.isFunction(children)) {
                      children = children({
                        ...tabsContext,
                        drawerFullScreen: this.state.drawerFullScreen
                      })
                    }
                    return (
                      <Tabs.TabPane
                        key={item.key}
                        {...item}
                        children={children}
                      />
                    )
                  })}
              </Tabs>
            </Drawer>
          </div>
        </div>
      </Spin>
    )
  }
}

export default withLocale(FanoTable)
