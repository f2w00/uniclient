const { join } = require('path')
const { appData } = require('./product.json')

export const client = join(__dirname, '../client')
export const plugins = join(__dirname, '../plugins')
export const platform = join(__dirname, '../platform')
export const workbench = join(__dirname, '../workbench')
export const src = join(__dirname, '../../src')
export const extensionHost = join(__dirname, '../client/extend/host.js')
export const mainPreloadPath = join(__dirname, '../workbench/preload.js')
export const mainViewPath = join(__dirname, '../workbench/index.html')
export const mainIconPath = join(__dirname, '../workbench/assets/icon/icon.ico')
export const appDataPath = appData
