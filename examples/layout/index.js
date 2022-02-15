import React from 'react'
import moment from 'moment'
import { LocaleProvider } from 'antd'
import 'moment/locale/zh-cn'
import zh_CN from 'antd/lib/locale-provider/zh_CN'

moment.locale('zh-cn')

export default props => <LocaleProvider locale={zh_CN}>{props.children}</LocaleProvider>