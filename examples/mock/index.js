export default {
  'get /api/radio/options': {
    data: {
      list: [
        {
          label: '未知',
          value: '0'
        },
        {
          label: '男',
          value: '1'
        },
        {
          label: '女',
          value: '2'
        }
      ]
    }
  },
  'get /api/select/options': {
    data: {
      list: [
        {
          label: 'Jack',
          value: 'jack'
        },
        {
          label: 'Lucy',
          value: 'lucy'
        },
        {
          label: 'Eason',
          value: 'eason'
        },
        {
          label: 'Ming',
          children: [
            {
              label: '未知',
              value: '0'
            },
            {
              label: '男',
              value: '1'
            },
            {
              label: '女',
              value: '2'
            }
          ]
        }
      ]
    }
  },
  'get /api/tree/options': {
    data: {
      range: 'ALL',
      page: 1,
      size: 20,
      sort: {
        value: 1
      },
      project: {},
      cond: {},
      list: [
        {
          value: '1',
          title: '沃艺信息'
        },
        {
          value: '2',
          title: '开发部',
          pid: '1'
        },
        {
          value: '36',
          title: '微信项目组',
          pid: '1'
        },
        {
          value: '37',
          title: 'BrandDB测试',
          pid: '1'
        },
        {
          value: '38',
          title: 'SH-财务部（Finance）',
          pid: '1'
        },
        {
          id: '39',
          value: '39',
          title: 'SH-内审部（Operation Excellence）',
          pid: '1'
        },
        {
          value: '4',
          title: '测试专用',
          pid: '1'
        },
        {
          value: '40',
          title: 'SH-IT部（Information Technology）',
          pid: '1'
        },
        {
          value: '41',
          title: 'DEXDEV',
          pid: '1'
        },
        {
          value: '42',
          title: '开发部子级',
          pid: '2'
        }
      ],
      totalrecords: 10,
      totalpages: 1
    }
  }
}
