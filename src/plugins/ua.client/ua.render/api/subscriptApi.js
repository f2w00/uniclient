import {
  request,
  post,
  get,
  put,
  deleteJson
} from '../utils/request.js'

/**
 * @params p 参数
 */
let subscriptApi = {
  subscriptInit: (p) => post('/subscript/init', p),
  subscriptModify: (p) => post('/subscript/modify', p),
  subscriptGroup: (p) => post('/subscript/item/group', p),
  subscriptSingle: (p) => post('/subscript/item/single', p),
  subscriptDelete: (p) => post('/subscript/item/delete', p),
}

export default subscriptApi
