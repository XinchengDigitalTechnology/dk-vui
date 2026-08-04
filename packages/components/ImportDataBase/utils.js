import * as XLSX from 'xlsx'

export const xlsxAccept = [
  '.xls',
  '.xlsx',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
].join(',')

export const getFileName = (source, defaultName = '导入模板.xlsx') => {
  if (!source) return defaultName
  if (typeof source === 'object' && source.name) return source.name
  if (typeof source !== 'string') return defaultName
  const pathName = source.split('?')[0]
  return pathName.slice(pathName.lastIndexOf('/') + 1) || defaultName
}

export const downloadByUrl = (url, filename) => {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  try {
    a.click()
  } finally {
    a.remove()
  }
}

const downloadByBlob = (blob, filename) => {
  const blobUrl = window.URL.createObjectURL(blob)
  downloadByUrl(blobUrl, filename)
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0)
}

export const downloadTemplate = async (source, filename) => {
  if (source instanceof Blob) {
    downloadByBlob(source, filename)
    return
  }

  try {
    const res = await fetch(source)
    if (!res.ok) throw new Error(`模板下载失败：${res.status}`)
    const blob = await res.blob()
    downloadByBlob(blob, filename)
  } catch (error) {
    downloadByUrl(source, filename)
  }
}

export const isXlsxFile = file => /\.xlsx?$/i.test(file?.name || '')

export const resolveResponseData = res => {
  if (res && Object.prototype.hasOwnProperty.call(res, 'data')) return res.data
  return res
}

export const normalizeResultList = data => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.list)) return data.list
  return []
}

export const mapRowByXlsxMatch = (row, xlsxMatch = {}) => {
  const matchKeys = Object.keys(xlsxMatch)
  if (!matchKeys.length) return row

  return Object.keys(row).reduce((result, key) => {
    const targetKey = xlsxMatch[key]
    if (targetKey) {
      result[targetKey] = row[key]
    }
    return result
  }, {})
}

export const parseXlsxFile = async file => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []
  const worksheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false })
}

export const parseXlsxFiles = async (files, xlsxMatch) => {
  const list = []
  for (const file of files) {
    const rows = await parseXlsxFile(file)
    list.push(...rows.map(row => mapRowByXlsxMatch(row, xlsxMatch)))
  }
  return list
}

export const createUploadFormData = files => {
  const formData = new FormData()
  files.forEach(file => formData.append('file', file, file.name))
  return formData
}

export const isResultError = item => {
  const text = `${item}`
  return text.includes('失败') || text.includes('错误')
}
