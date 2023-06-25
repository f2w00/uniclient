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
let sessionApi = {
    sessionInit: (p) => post('/session/init', p),
    sessionBrowseroot: (p) => get('/session/browse/root', p),
    sessionRead: (p) => post('/session/read', p),
    sessionBrowse: (p) => post('/session/browse', p)
}

export default sessionApi
