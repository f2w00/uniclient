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
let clientApi = {
  clientInit: (p) => post('/client/init', p),
  clientConnect: (p) => post('/client/connect', p),
  clientEndpoint: (p) => post('/client/endpoints', p),
  project_info: (p) => get('/client/project_info', p),
  record_names: (p) => get('/client/record_names', p),
  restore: (p) => post('/client/restore', p)
}

export default clientApi
