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
  clientEndpoint: (p) => post('/client/endpoints', p)
}

export default clientApi
