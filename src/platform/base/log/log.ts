import {app} from "electron";
import log, {Configuration, Logger} from "log4js";
import {MainEvents, rendererEvents} from "../../ipc/events/ipc.events.js";
import {ipcClient} from "../../ipc/handlers/ipc.handler.js";
import {ClientStore, ConfigNames} from "../../../client/store/store.js";

const {configure, getLogger} = log;

type Source = string | undefined;
type Warn = string;
type Error = string;
type Info = string;
type loggerName = string;

export class InfoModel {
    timeStamp: string;
    source: Source;
    information: string;
    message?: object;

    constructor(source: Source, information: string, message?: object) {
        this.timeStamp = new Date().toLocaleString();
        this.source = source;
        this.information = information;
        this.message = message;
    }
}

export class ClientWarn extends InfoModel {
    warn?: string;

    constructor(
        source: string,
        information: Warn,
        warn?: string,
        message?: object
    ) {
        super(source, information, message);
        if (warn) this.warn = warn;
    }
}

export class ClientError extends InfoModel {
    error?: string;
    trace?: string;

    constructor(
        source: string,
        information: Error,
        error?: string,
        trace?: string
    ) {
        super(source, information);
        if (error) this.error = error;
        if (trace) this.trace = trace;
    }
}

export class ClientInfo extends InfoModel {
    constructor(source: string, information: Info, message?: object) {
        super(source, information, message);
    }
}

export class Log {
    private static clientLogger: Logger = getLogger("client");

    constructor(loggerName: loggerName = 'client', config?: Configuration) {
        ipcClient.onClient('Log.info', (message: ClientInfo) => {
            Log.info(message)
        })
        ipcClient.onClient('Log.warn', (message: ClientWarn) => {
            Log.warn(message)
        })
        ipcClient.onClient('Log.error', (message: ClientError) => {
            Log.error(message)
        })
        ipcClient.onClient('Log.configure', (config: Configuration) => {
            this.configureLog(config)
        })
        this.configureLog(config)
        this.initBind()
    }

    static info(info: ClientInfo) {
        try {
            Log.clientLogger.info(info.information, {
                source: info.source,
                ...info.message,
            });
            ipcClient.emitToRender(MainEvents.logEmitEvents.info, info);
        } catch (e: any) {
            throw e;
        }
    }

    static error(info: ClientError) {
        try {
            Log.clientLogger.error(info.information, {
                source: info.source,
                error: info.error,
                stack: info.trace,
                ...info.message,
            });
            ipcClient.emitToRender(MainEvents.logEmitEvents.error, info);
        } catch (e: any) {
            throw e;
        }
    }

    static warn(info: ClientWarn) {
        try {
            Log.clientLogger.warn(info.information, {
                source: info.source,
                warn: info.warn,
                ...info.message,
            });
            ipcClient.emitToRender(MainEvents.logEmitEvents.warn, info);
        } catch (e: any) {
            throw e;
        }
    }

    /**
     * @description 具体参考log4js配置方法
     * @param conf
     */
    configureLog(conf?: Configuration) {
        try {
            if (conf) {
                ClientStore.set("config", ConfigNames.log, conf);
            } else {
                conf = {
                    appenders: {
                        client: {
                            type: "file",
                            filename: app.getPath("appData") + "/logs/client.log",
                            maxLogSize: 50000, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
                        },
                    },
                    categories: {default: {appenders: ["client"], level: "info"}},
                };
                if (!ClientStore.has("config", ConfigNames.log)) {
                    ClientStore.set("config", ConfigNames.log, conf);
                }
                configure(conf);
            }
        } catch (e: any) {
            throw e;
        }
    }

    initBind() {
        ipcClient.on(rendererEvents.logEvents.info, (event, args: ClientInfo) => {
            Log.info(args);
        });
        ipcClient.on(rendererEvents.logEvents.error, (event, args: ClientError) => {
            Log.error(args);
        });
        ipcClient.on(rendererEvents.logEvents.warn, (event, args: ClientWarn) => {
            Log.warn(args);
        });
    }
}

//todo 安装时,应当初始化log和database服务路径
