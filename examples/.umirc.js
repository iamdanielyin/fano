// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: false,
      title: 'Fano',
      dll: false,
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//
        ]
      }
    }]
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    },
    '/assets': {
      target: 'http://localhost:8080',
      changeOrigin: true
    },
    '/api/v1': {
      target: 'https://a.example.com',
      changeOrigin: true
    },
    '/public': {
      target: 'https://a.example.com',
      changeOrigin: true
    },
    '/public/upload/': {
      target: 'https://a.example.com',
      changeOrigin: true
    }
  }
}