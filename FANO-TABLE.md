

<a name="4798edf5"></a>
## FanoTable简介

<br />FanoTable是用React + ant design开发的一个功能强大，通过配置可快速生成中后台管理端页面，实现添加、修改、查询、删除、导入、导出等等的一个多功能组件。<br />
<br />

<a name="a1eda7f4"></a>
## FanoTable基本用法


```javascript
import React from 'react'
import { FanoTable } from 'fano-antd'
import { withLocale } from 'kuu-tools'

class Role extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }
  render () {
    const columns = [
      {
        title: this.props.L('kuu_role_name', '角色名称'),
        dataIndex: 'Name'
      }
    ]

    return (
      <FanoTable
        columns={columns}
        url= '/role'
      />
    )
  }
}

export default withLocale(Role)
```

<br />

<a name="4b30f41e"></a>
## FanoTable API
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | 默认API | string |  |
| listUrl | 列表API，若此参数为空，则取url | string |  |
| createUrl | 新增API，若此参数为空，则取url | string |  |
| updateUrl | 更新API，若此参数为空，则取url | string |  |
| deleteUrl | 删除API，若此参数为空，则取url | string |  |
| importUrl | 导入API，若此参数为空，则取url | string |  |
| columns | 表格列的配置描述 | Array |  |
| addable | 是否有新增权限，整体控制新增相关按钮 | true | () => true |  |
| editable | 是否有编辑权限，整体控制编辑相关按钮 | true | () => true |  |
| deleteable | 是否有删除权限，整体控制删除相关按钮 | true | () => true |  |
| fetchOnInit | 是否首次自动查询 | true | false | true |
| rowClickSelected | 表格行是否可选择，默认可选 | boolean | true |
| disabledRow | 禁止行操作（可打开表单） | function: (record) |  |
| fillTAP | 表格头部操作配置 | object |  |
| fillRAP | 表格行操作配置 | object |  |
| tableActions | 表格头部自定义操作 | Array |  |
| rowActions | 表格行自定义操作 | Array |  |
| actionsWidth | 表格 "操作" 列宽度 | string|number |  |
| hideActions | 隐藏操作列 | boolean |  |
| filter | 过滤条件 | Array |  |
| filterReplace | 是否替换全部过滤条件，与参数filter配合使用 | boolean | false |
| filterInitialValue | 搜索表单初始数据(对应form字段，可不全) | Object |  |
| onFilterReset | 搜索表单重置回调 | ()=>{} |  |
| onFilter | 搜索按钮点击回调（返回false将中断后续操作） | err => {} |  |
| onFilterValuesChange | 搜索表单值变更回调（返回false将中断后续操作） | (changedValues, allValues) => {} |  |
| form | 表单配置 | Array |  |
| formInitialValue | 表单初始数据(对应form字段，可不全) | Object |  |
| onFormFieldsChange | 表单字段change回调 | function: (value, all) |  |
| defaultColumnWidth | 默认column宽度 | String |  |
| rowClickToggleDrawer | 双击打开抽屉(<br />支持设置函数来控制是否弹出右侧面板<br />) | Boolean<br /> | Function: (record) => Boolean | true |
| actionsWidth | 操作列宽度 | string|number |  |
| drawerWidth | 抽屉宽度 | String |  |
| onDrawerVisibleChange | 抽屉change回调 |  |  |
|  |  |  |  |
| tabs | 自定义抽屉页签 | array: [{key, show, tab,style,children: (ctx)}] |  |
| afterList | table获取数据之后钩子 | Function: (json: object) => {} |  |
| arrayToTree | 数组转树结构规则([更多详情](https://github.com/alferov/array-to-tree)<br />) | Object: {<br />customID: '',<br />parentProperty: '',<br />childrenProperty: ''<br />} |  |
| onExport | 自定义导出 | function: (params=:{query, data,columns, filename }) |  |
| exportFileName | 自定义导出文件名 | string |  |
| beforeUpdate | 更新前处理数据 | function(value: {cond: object, doc: object}) |  |
| beforeCreate | 创建前处理数据<br />（返回false将中断后续操作） | (formChangedValues, formRecord) => {} |  |
| beforeDelete | 调用删除请求前回调（返回false将中断后续操作） | (body, formRecord) => {} |  |
| onFormRecord | 打开表单前处理数据 | function (value) |  |
| beforeList | 加工处理query参数 | Function: (query) => newQuery |  |


<br />

<a name="82dd2c7c"></a>
### columns API
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| title | 列头显示文字，注意：格式为 | string |  |
| dataIndex | 列数据在数据项中对应的 key，支持 a.b.c的嵌套写法 | string |  |
| render | 生成复杂数据的渲染函数，参数分别为当前行的值，当前行数据，行索引，@return   里面可以设置表格行/列合并 | Function(text, record, index) {} |  |
| exporter | 用于自定义导出处理。与render用法类似 | Function(text, record, column){} |  |


<br />FanoTable为columns的render提供了一些配置去生成常见的结果<br />

1. **date**     渲染常见的日期格式，可传参数。例如：



```javascript
{
  title: this.props.L('kuu_role_ts', '时间戳'),
  dataIndex: 'Ts',
  render: 'date,YYYY-MM-DD HH:mm:ss'
 }
```

<br />注意： 格式化参数需要遵循moment日期格式  [参考moment.js](https://momentjs.com/docs/#/displaying/)<br />

2. **fromNow**    相对当前日期，可传参数。例如：



```javascript
{
  title: this.props.L('kuu_role_ts', '时间戳'),
  dataIndex: 'Ts',
  render: 'fromNow,YYYY-MM-DD'
}
```


3. **image**     生成图片，无参数，例如：



```javascript
{
  title: this.props.L('kuu_role_avatar', '头像'),
  dataIndex: 'avatar',
  render: 'image'
}
```


4. **tags**      生成tag标签，可传参数，例如：



```javascript
{
  title: this.props.L('kuu_role_code', '标签'),
  dataIndex: 'tags',
  render: 'tags,{"A1":"red","A2":"blue"}'
}
```

<br />注意： tags参数必须为JSON字符串<br />

5. **color   **生成有颜色的结果，无参数。例如：



```javascript
{
  title: this.props.L('kuu_role_code', '编码'),
  dataIndex: 'Code',
  render: 'color'
}
```


6. **rate     **展示评分,可传参数。例如：



```javascript
{
  title: this.props.L('kuu_role_createdbyid', 'count'),
  dataIndex: 'count',
  render: 'rate,disabled:true,value:3'
}
```

<br />注意： 详细参数配置 [参考Rate](https://ant.design/components/rate-cn/)<br />

7. **slider  **生成滑动滚动条，可传参数。例如：



```javascript
{
  title: this.props.L('kuu_role_createdbyid', 'count'),
  dataIndex: 'count',
  render: 'slider,max:5,min:2'
}
```

<br />注意： 详细参数配置 [参考Slider](https://ant.design/components/slider-cn/)<br />

8. **switch   **生成开关选择器，可传参数，例如：



```javascript
{
  title: this.props.L('kuu_role_createdbyid', 'isDisable'),
  dataIndex: 'isDisable',
  render: 'switch,checked:true,disabled:true'
}
```

<br />注意： 详细参数配置 [参考Switch](https://ant.design/components/switch-cn/)<br />

9. **checkbox   **生成选择框，可传参数，例如：



```javascript
{
  title: this.props.L('kuu_role_createdbyid', 'isSelect'),
  dataIndex: 'isSelect',
  render: 'checkbox,checked:true,disabled:true'
}
```

<br />注意： 详细参数配置 [参考Checkbox](https://ant.design/components/checkbox-cn/)<br />

10. **copy  **生成文本复制，例如：
```javascript
{
  title: this.props.L('kuu_role_username', 'Username'),
  dataIndex: 'username',
  render: 'copy'
}
```


<a name="bcdc7f35"></a>
### fillTAP API

<br />fillTAP提供了10种常见的操作方法。分别为：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| add | 添加 | boolean/object |  |
| del | 删除 | boolean/object |  |
| cols | 表格隐藏列 | boolean/object |  |
| filter | 表格过滤 | boolean/object |  |
| sort | 表格排序 | boolean/object |  |
| import | 导入 | boolean/object |  |
| export | 导出 | boolean/object |  |
| sync | 刷新 | boolean/object |  |
| expend | 展开 | boolean/object |  |
| collapse | 折叠 | boolean/object |  |


<br />每个操作方法有如下配置：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| show | 是否显示 | Function(record) | true |
| key | 表示当前操作，比如添加操作则为'add' | string |  |
| icon | 显示的图标（[参考Icon的type属性](https://ant.design/components/icon-cn/)<br />） | string |  |
| text | 格式为: this.props.L(a,b) |  |  |
| sort | 操作排序，序号越小排在越前。 |  |  |
| add(100)，collapse(1000) | number |  |  |
| type | button类型（[参考Button的type属性](https://ant.design/components/button-cn/)<br />） | string |  |
| badge | 展示徽标数 | number |  |
| onClick | 点击按钮时的回调 | Function |  |
| wrapper | 点击时展示自定义内容 | Function |  |
| tooltip | 鼠标移动到按钮时的默认提示 | Function |  |
| popconfirm | 点击展示气泡提示框 | Function |  |


<br />注意：<br />

- 如果操作没有其他属性配置，只是单纯显示/隐藏，则可以直接这样配置，如下：



```javascript
// 用法一
const fillTAP = {
  add: {
    show: false
  }
}

// 用法二
const fillTAP = {
  add: true   // 直接设置成true,表示显示
}
```


- 如果操作有其他参数配置时，使用方法如下：



```javascript
const fillTAP = {
  add: {
    show: true,
    type: 'primary',
    sort: 200,
    icon: 'plus-circle',
    onClick: (e) => {
    	console.log('e =', e)
    }
  }
}
```

<br />

<a name="fdc10d1e"></a>
### fillRAP API

<br />表格行操作提供默认的两种操作。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| edit | 编辑 | boolean/object |  |
| del | 删除 | boolean/object |  |


<br />fillRAP操作参数配置与上面fillTAP操作参数配置类似。<br />
<br />

<a name="6fa6fb62"></a>
### tableActions API

<br />如果fillTAP的操作满足不了需求时，则可以自定义操作。tableActions的配置参数与fillTAP的操作配置参数类似：

例子： 比如自定义一个搜索操作功能<br />

```javascript
const tableActions = [
  {
    icon: 'search'
    text: this.props.L('kuu_dataprivileges_search', '搜索'),
    onClick: () => this.handleSearch()
  }
]
```

<br />自定义渲染<br />

```jsx
{
  icon: 'login',
  text: this.props.L('kuu_assign_student', '分班'),
  // disabledNotSelected: true, // 没选择行时按钮为disable状态
  // popconfirm: {}, // 同popconfirm的参数, onConfirm会调用onClick参数
  wrapper:  (children) {
    // 自定义组件: 可以写自己的组件和逻辑
    return <div title='测试'>{children}</div>
  }
}
```

<br />

<a name="9d75e316"></a>
### rowActions API

<br />如果fillRAP的操作满足不了需求时，则可以自定义操作。rowActions的配置参数与fillTAP的操作配置参数类似：

例子： 比如自定义一个查看操作功能<br />

```javascript
const rowActions = [
  {
    icon: 'snippets',
    text: this.props.L('kuu_dataprivileges_view', '查看'),
    onClick: () => this.handleView(),
    show: (item) => item.status === 1,
    tooltip: this.props.L('kuu_dataprivileges_view detail','查看详情操作')
  }
]
```

<br />

<a name="bc7e2741"></a>
### filter API

<br />如果表格需要过滤功能，则可加入filter，filter参数配置如下：

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| name | 字段 | string |  |
| label | 过滤名称 | string |  |
| render | 自定义渲染组件 | function: (v, onChange) |  |
| operators | 查询操作符 | []string | ['eq'] |
| onCond | 自定义查询条件拼接 | function: (item) => item |  |
| show | 是否显示 | function: (cond, searchCollapsed) => Boolean | true |


<br />operators：

- eq：=
- gt：>
- lt：<
- gte：>=
- lte：<=
- ne：!=


<br />例如：<br />

```javascript
const filter = [
  { 
    label: '备注',
    name: 'Remark'
  },
  { 
    label: '编码',
    name: 'Code'
  }
]
```

<br />

<a name="37e75ff8"></a>
### table实例方法

<br />获取实例对象后可调用表格方法：<br />

```jsx
<FanoTable ref={instance => this.tableRef = instance} />
```


```javascript
this.tableRef.handleRefresh() // 刷新表格
this.tableRef.getSelectedRows() // 获取选中行
this.tableRef.toggleDrawerVisible(visible, record, showTabKeys) // 打开或关闭抽屉

this.tableRef.getFormValue(field) // 取编辑详情表单指定字段的值
this.tableRef.setFormValue({key:value}) // 设置编辑详情表单指定字段的值

this.tableRef.resetSearchForm() // 重置搜索表单
this.tableRef.getSearchFormValue(field) // 取搜索表单指定字段的值
this.tableRef.setSearchFormValue({key:value}) // 设置搜索表单指定字段的值
```


<a name="v81JE"></a>
### 表单配置


```javascript
<FanoTable
  config={[
    {
      label: 'Username', // 也支持JSX
      type: 'input',
      tooltip: 'Username helper...', // 快速提示设置，也支持配置对象值来调整Tooltip属性：{trigger:'click'}
      props: {
        layout: {
          colProps: {} // <Col {... colProps}>
        },
        formItemProps: {}, // <Form.Item {...formItemProps}>
        fieldOptions: {} // getFieldDecorator(item.path, fieldOptions)
      }
    }
  ]}
  formProps={{
    formLayout: 'vertical', // 默认为vertical
    layout: {
      rowProps: { gutter: 24 } // <Row {... rowProps}>，默认为{gutter:24}
    }
  }}
/>
```


<a name="cf3e2664"></a>
### 案例
<a name="KrusU"></a>
#### 导出数据


```javascript
import { exportTable } from 'fano-antd/lib/utils/tools'
exportTable(columns, dataSource, '打款记录', 'xlsx', childrenColumns, childrenDataKey)
```


