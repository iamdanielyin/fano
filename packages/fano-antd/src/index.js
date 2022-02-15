import input from './components/FanoInput'
import number from './components/FanoNumber'
import textarea from './components/FanoTextArea'
import radio from './components/FanoRadio'
import checkbox from './components/FanoCheckbox'
import select from './components/FanoSelect'
import treeselect from './components/FanoTreeSelect'
import tree from './components/FanoTree'
import datepicker from './components/FanoDatePicker'
import rangepicker from './components/FanoRangePicker'
import monthpicker from './components/FanoMonthPicker'
import weekpicker from './components/FanoWeekPicker'
import timepicker from './components/FanoTimePicker'
import rate from './components/FanoRate'
import slider from './components/FanoSlider'
import sw from './components/FanoSwitch'
import upload from './components/FanoUpload'
import tags from './components/FanoTags'
import render from './components/FanoRender'
import progress from './components/FanoProgress'
import avatar from './components/FanoAvatar'
import plaintext from './components/FanoPlainText'
import table from './components/FanoTable'
import color from './components/FanoColor'
import editor from './components/FanoEditor'
import json from './components/FanoJSON'
import icon from './components/FanoIcon'
import group from './components/FanoGroup'
import { responsiveLayout } from './utils/layout'
import FanoFormWrapper, { FanoWrapper } from './form'

export const types = {
  input,
  number,
  textarea,
  radio,
  checkbox,
  select,
  treeselect,
  tree,
  datepicker,
  rangepicker,
  monthpicker,
  weekpicker,
  timepicker,
  rate,
  slider,
  switch: sw,
  upload,
  tags,
  render,
  progress,
  avatar,
  plaintext,
  table,
  color,
  editor,
  json,
  icon,
  group
}
export const FanoInput = input
export const FanoNumber = number
export const FanoTextArea = textarea
export const FanoRadio = radio
export const FanoCheckbox = checkbox
export const FanoSelect = select
export const FanoTreeSelect = treeselect
export const FanoTree = tree
export const FanoDatePicker = datepicker
export const FanoRangePicker = rangepicker
export const FanoMonthPicker = monthpicker
export const FanoWeekPicker = weekpicker
export const FanoTimePicker = timepicker
export const FanoRate = rate
export const FanoSlider = slider
export const FanoSwitch = sw
export const FanoUpload = upload
export const FanoTags = tags
export const FanoRender = render
export const FanoProgress = progress
export const FanoAvatar = avatar
export const FanoPlainText = plaintext
export const FanoTable = table
export const FanoColor = color
export const FanoEditor = editor
export const FanoJSON = json
export const FanoIcon = icon
export const FanoGroup = group

export const ResponsiveLayout = responsiveLayout
export const Fano = FanoWrapper

export default FanoFormWrapper
