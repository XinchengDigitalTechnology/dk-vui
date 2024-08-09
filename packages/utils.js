import GlobalConfig from './config'
import XEUtils from 'xe-utils'

/**
 * 
 * @param {*} urls 地址数组
 * @param {boolean} blob 是否转文件流 
 * @returns {Promise}
 */
export const download = async (urls, blob) => {
  // 批量下载图片
  if (!Array.isArray(urls)) urls = [urls]
  for (const url of urls) {
    const type = url.substring(url.lastIndexOf('.') + 1).toLowerCase()
    if (type === 'pdf') {
      window.open(url, "_blank",
        'height=700, width=1200, top=200, left=300,toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no')
    } else {
      const filename = url.slice(url.lastIndexOf('/') + 1)
      if (blob) {
        // 服务端必须允许跨域
        const res = await fetch(url)
        const newblob = await res.blob()
        const blobUrl = window.URL.createObjectURL(newblob)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(blobUrl)
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
      }
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }
  return true
}

/**
 * 
 * @param {array} routerFiles 文件列表
 * @param {string} baseName 基础名称，子应用必须传
 * @returns 
 */
export const getRoutes = (routerFiles, baseName = '') => {
  const routeList = []
  const upperName = name => baseName + name.split('/').map(da => da.replace(/^\w/g, d => d.toUpperCase())).join('')
  for (const [key, component] of Object.entries(routerFiles)) {
    const path = key.replace('../views', '').replace('/index.vue', '')
    const isEdit = path.indexOf('/edit') > -1
    // 编辑页
    if (isEdit) {
      const page = component.default.name?.split(',') // 可配置要生成的编辑页
      const pages = page?.length > 1 ? page : ['edit', 'create', 'view'] // 编辑页默认生成 添加、编辑、查看页面
      const types = pages.map(name => ({ name, path: `/${name}/:id` }))
      types.forEach(d => {
        let name = upperName(path.replace('edit', d.name).replace('/', ''))
        routeList.push({
          path: path.replace('/edit', d.path),
          name,
          component: async () => {
            // 重写页面name，与路由name保持一致，支持keep-alive缓存
            let name = upperName(path.replace('edit', d.name).replace('/', ''))
            const com = XEUtils.clone(component, true)
            com.default.name = name
            return com
          },
          props: true,
          hidden: true,
          meta: {}
        })
      })
    } else {
      // 基础页面
      const name = upperName(path.replace('/', ''))
      const com = XEUtils.clone(component, true)
      // 重写页面name，与路由name保持一致，支持keep-alive缓存
      com.default.name = name
      routeList.push({
        path: path,
        name,
        component: async () => com,
        props: false,
        hidden: false,
        meta: {}
      })
    }
  }
  return routeList
}

export const setup = (options) => {
  // 参数配置
  if (options) {
    if (options.scrollHideForm === true) {
      GlobalConfig.table.scrollHideForm = true
    }
    const { proxy } = options.tableConfig?.formConfig || {}
    if (proxy) {
      GlobalConfig.table.formConfig.proxy = proxy
    }
  }
  XEUtils.merge(GlobalConfig, options)
}

/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on = (function() {
  if (document.addEventListener) {
    return function(element, event, handler, options = false) {
      if (element && event && handler) {
        element.addEventListener(event, handler, options)
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})(document)

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function() {
  if (document.removeEventListener) {
    return function(element, event, handler, options = false) {
      if (element && event) {
        element.removeEventListener(event, handler, options)
      }
    }
  } else {
    return function(element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})(document)

/**
 * * 计算鼠标移动距离
 * @param {object} functions
 */
export const onMousemove = function(fns) {
  const { start, moveing, end } = fns
  start && start()

  let startX = 0
  let moveX = 0
  let startY = 0
  let moveY = 0

  document.onselectstart = function() { return false }
  document.ondragstart = function() { return false }

  const handleMouseMove = (e) => {
    if (e) {
      !startX && (startX = e.clientX)
      !startY && (startY = e.clientY)
      moveX = e.clientX - startX
      moveY = e.clientY - startY
    }

    moveing && moveing(moveX, moveY)
  }

  const handleMouseUp = () => {
    end && end(moveX, moveY)

    off(document, 'mousemove', handleMouseMove)
    off(document, 'mouseup', handleMouseUp)
    document.onselectstart = null
    document.ondragstart = null
  }
  on(document, 'mousemove', handleMouseMove)
  on(document, 'mouseup', handleMouseUp)
}