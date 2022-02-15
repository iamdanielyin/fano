# Fano

> A magical UI generator.

## 特性

- **增强原生组件**
- **可通过配置生成响应式表单**
- **可生成界面代码**
  - 生成基于增强组件的代码
  - 生成基于原生组件的代码

## 使用

- 可以查看 [FanoTable帮助手册](/FANO-TABLE.md)
- 可以查看 [Examples](/examples)

## Changelog

### 0.3.61

`2021-05-13`

- FanoTable
    - ⌨ 搜索表单 filterReplace 下不加载 form 下对应key配置。

### 0.3.59

`2021-05-13`

- FanoTable
    - ⌨ 搜索表单 filterReplace 下不过滤禁用。

### 0.3.58

`2021-03-01`

- FanoTable
    - 🐞 handleSiderSave未声明异步。

### 0.3.55

`2021-01-08`

- FanoRender
    - ⌨ 移除forwardRef相关代码。

### 0.3.42

`2020-08-18`

- FanoJSON
    - 🐞 修复FanoJSON默认值为空时设值失败的bug。
- FanoForm
    - 🌟 表单域label支持JSX。
    - 🌟 表单域支持设置快速提示tooltip属性。
    - ⌨️ 优化表单布局配置。
- FanoTable
    - ⌨️ 设置form默认布局配置为`vertical`，表单配置详见/FANO-TABLE.md#v81JE。

### 0.3.35

`2020-07-21`

- FanoTable
    - 🐞 修复首次加载时，搜索表单不渲染的bug。

### 0.3.34

`2020-07-16`

- FanoTable
    - 🐞 修复filter配置更新后，搜索表单被filterInitialValue覆盖的bug（待验证）。
    - 🌟 新增beforeList加工处理query参数。
    - 🌟 新增filter支持配置show（支持函数）来控制查询表单域是否显示。
    - 🌟 新增rowClickToggleDrawer支持设置函数来控制是否弹出右侧面板。
