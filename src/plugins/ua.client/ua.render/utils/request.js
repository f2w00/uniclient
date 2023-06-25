// 1、引入 axios
//TODO 通过以下方式是为了解决iframe页面require is undefined问题 但可能带来其他问题
const require = parent.window.require;
const axios = require('axios')

// 2、创建一个 axios 的实例对象
let baseURL_dev = "http://localhost:3030"  //开发环境的url地址
let baseURL_pro = ""  //上线后公司域名utl地址
let baseURL_test = "" //内网地址，测试环境url地址

const request = axios.create({
    // 基准路径
    baseURL: baseURL_dev,//3、设置开发域名
    //超时时间的设置 ms
    timeout: 5000,
    headers: {
        "Content-Type": "application/json;charset=UTF-8"
    } //携带过去的请求头
})

// request 请求拦截器
request.interceptors.request.use(
    config => {
        // 对config进行处理
        // console.log(config)
        return config
    },
    error => {
        // console.warn(error)
        return Promise.reject(error)
    }
)

// response 响应拦截器
request.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        //这里能获取到请求回来的数据，这里判断是否请求成功
        if (response.data && response.data.code === 200) {
            // console.log(response.data)
            return response.data
        } else {
            console.log("请求失败:", response.data)
            return response.data
        }
    },
    error => {
        // 对响应错误做点什么
        console.warn(error)
        return Promise.reject(error)
    }
)
/**
 * post 请求
 * @param url 接口路径
 * @param params 接口参数
 * return {Promise<unknown>}
 */
function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        request({
            method: 'post',
            url: url,
            data: params,
            headers: {
                Accept: 'application/json ',
                'Content-Type ': 'application/json; charset=UTF-8',
            },
        }).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * get 请求
 * @param url 接口路径
 * @param param 接口参数
 * return {Promise<unknown>}
 */
function get(url, param = {}) {
    let params = {
        params: param
    }
    return new Promise((resolve, reject) => {
        request
            .get(`${url}`, params)
            .then((res) => {
                resolve(res)
            }).catch((error) => {
                reject(error)
            })
    })
}

/**
 * put 请求
 * @param url 接口路径
 * @param params 接口参数
 * return {Promise<unknown>}
 */
function put(url, params = {}) {
    return new Promise((resolve, reject) => {
        request({
            method: 'put',
            url: url,
            data: params,
            headers: {
                Accept: 'application/json ',
                'Content-Type ': 'application/json; charset=UTF-8',
            },
        }).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * delete 请求
 * @param url 接口路径
 * @param params 接口参数
 * return {Promise<unknown>}
 */
function deleteJson(url, params = {}) {
    return new Promise((resolve, reject) => {
        request({
            method: 'delete',
            url: url,
            data: params,
            headers: {
                Accept: 'application/json ',
                'Content-Type ': 'application/json; charset=UTF-8',
            },
        }).then((res) => {
            resolve(res)
        }).catch((error) => {
            reject(error)
        })
    })
}

// 导出实例
export {
    request,
    post,
    get,
    put,
    deleteJson
}
