import { configure, getLogger, Configuration, Logger } from 'log4js'
import { LocalEvents } from '../../ipc/events/ipc.events.js'
import { ipcClient } from '../../ipc/handlers/ipc.handler.js'
import { ClientStore, StartRecord } from '../../../client/store/store.js'
import { appDataPath } from '../../../client/paths.js'

enum ConfigNames {
    log = 'LogConfig',
}

type Source = string | undefined
type Warn = string
type Error = string
type Info = string
type loggerName = string

export class InfoModel {
    timeStamp: string
    source: Source
    information: string
    message?: object

    constructor(source: Source, information: string, message?: object) {
        this.timeStamp = new Date().toLocaleString()
        this.source = source
        this.information = information
        this.message = message
    }
}

export class ClientWarn extends InfoModel {
    warn?: string

    constructor(source: string, information: Warn, warn?: string, message?: object) {
        super(source, information, message)
        if (warn) this.warn = warn
    }
}

export class ClientError extends InfoModel {
    error?: string
    trace?: string

    constructor(source: string, information: Error, error?: string, trace?: string) {
        super(source, information)
        if (error) this.error = error
        if (trace) this.trace = trace
    }
}

export class ClientInfo extends InfoModel {
    constructor(source: string, information: Info, message?: object) {
        super(source, information, message)
    }
}

/**
 * 如果调用本Log,那么默认是向公共目录下进行记录,如果希望使用更改log路径和配置,请使用LogPrivate
 */
export class Log {
    private static clientLogger: Logger

    constructor(loggerName: loggerName = 'client', config?: Configuration) {
        ipcClient.onClient('Log:info', (info: any) => {
            ipcClient.emitToRender(LocalEvents.logEmitEvents.info, info)
        })
        ipcClient.onClient('Log:error', (info: any) => {
            ipcClient.emitToRender(LocalEvents.logEmitEvents.error, info)
        })
        ipcClient.onClient('Log:warn', (info: any) => {
            ipcClient.emitToRender(LocalEvents.logEmitEvents.warn, info)
        })
        this.configureLog(config)
        Log.clientLogger = getLogger(loggerName)
        StartRecord.completeLoading('log')
    }

    static info(info: ClientInfo) {
        try {
            Log.clientLogger.info(info.information, {
                source: info.source,
                ...info.message,
            })
            ipcClient.emitToRender(LocalEvents.logEmitEvents.info, info)
        } catch (e: any) {
            throw e
        }
    }

    static error(info: ClientError) {
        try {
            Log.clientLogger.error(info.information, {
                source: info.source,
                error: info.error,
                stack: info.trace,
                ...info.message,
            })
            ipcClient.emitToRender(LocalEvents.logEmitEvents.error, info)
        } catch (e: any) {
            throw e
        }
    }

    static warn(info: ClientWarn) {
        try {
            Log.clientLogger.warn(info.information, {
                source: info.source,
                warn: info.warn,
                ...info.message,
            })
            ipcClient.emitToRender(LocalEvents.logEmitEvents.warn, info)
        } catch (e: any) {
            throw e
        }
    }

    /**
     * @description 具体参考log4js配置方法
     * @param conf
     */
    configureLog(conf?: Configuration) {
        try {
            if (!conf) {
                conf = {
                    appenders: {
                        client: {
                            type: 'file',
                            filename: appDataPath + '/logs/client.log',
                            maxLogSize: 50000, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
                        },
                    },
                    categories: { default: { appenders: ['client'], level: 'info' } },
                }
            }
            configure(conf)
        } catch (e: any) {
            throw e
        }
    }
}

export class LogPrivate {
    private clientLogger: Logger

    constructor(loggerName: loggerName = 'client', config?: Configuration) {
        this.clientLogger = getLogger(loggerName)
        this.configureLog(config)
    }

    info(info: ClientInfo) {
        try {
            this.clientLogger.info(info.information, {
                source: info.source,
                ...info.message,
            })
            this.emitToClient('Log:info', info)
        } catch (e: any) {
            throw e
        }
    }

    error(info: ClientError) {
        try {
            this.clientLogger.error(info.information, {
                source: info.source,
                error: info.error,
                stack: info.trace,
                ...info.message,
            })
            this.emitToClient('Log:error', info)
        } catch (e: any) {
            throw e
        }
    }

    warn(info: ClientWarn) {
        try {
            this.clientLogger.warn(info.information, {
                source: info.source,
                warn: info.warn,
                ...info.message,
            })
            this.emitToClient('Log:warn', info)
        } catch (e: any) {
            throw e
        }
    }

    /**
     * @description 具体参考log4js配置方法
     * @param conf
     */
    configureLog(conf?: Configuration) {
        try {
            if (!conf) {
                conf = {
                    appenders: {
                        client: {
                            type: 'file',
                            filename: appDataPath + '/logs/client.log',
                            maxLogSize: 50000, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
                        },
                    },
                    categories: { default: { appenders: ['client'], level: 'info' } },
                }
            }
            configure(conf)
        } catch (e: any) {
            throw e
        }
    }

    emitToClient(event: string, ...args: any) {
        process.send
            ? process.send({
                  purpose: 'sendToClient',
                  event: event,
                  ...args,
              })
            : null
    }
}
