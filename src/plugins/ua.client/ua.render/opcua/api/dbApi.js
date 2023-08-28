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
let dbApi = {
    init: (p) => post('/db/init', p),
    insert: (p) => post('/db/insert', p),
    insert_many: (p) => post('/db/insert_many', p),
    create_table: (p) => post('/db/create_table', p),
}

export default dbApi
