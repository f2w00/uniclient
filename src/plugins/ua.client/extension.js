module.exports = {
    extension: {
        activate: () => {
            //做一些注册之类的事情
            console.log('activate')
        },
        beforeClose: () => {
            const { SubscriptService } = require('./ua.servant/services/subscript.service')
            const { RecordUtil } = require('./ua.servant/utils/util')
            const { Config } = require('./config/config.default')
            //不同进程
            SubscriptService.record()
            Config.beforeClose()
            RecordUtil.recordToJson(Config.recordJsonFilePath + Config.usingRecord)
            console.log('closed')
        },
    },
}
