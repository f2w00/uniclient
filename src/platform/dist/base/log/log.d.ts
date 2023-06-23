import { Configuration } from 'log4js';
type Source = string | undefined;
type Warn = string;
type Error = string;
type Info = string;
type loggerName = string;
export declare class InfoModel {
    timeStamp: string;
    source: Source;
    information: string;
    message?: object;
    constructor(source: Source, information: string, message?: object);
}
export declare class ClientWarn extends InfoModel {
    warn?: string;
    constructor(source: string, information: Warn, warn?: string, message?: object);
}
export declare class ClientError extends InfoModel {
    error?: string;
    trace?: string;
    constructor(source: string, information: Error, error?: string, trace?: string);
}
export declare class ClientInfo extends InfoModel {
    constructor(source: string, information: Info, message?: object);
}
export declare class Log {
    private static clientLogger;
    constructor(loggerName?: loggerName, config?: Configuration);
    static info(info: ClientInfo): void;
    static error(info: ClientError): void;
    static warn(info: ClientWarn): void;
    configureLog(conf?: Configuration): void;
    static beforeClose(): void;
}
export declare class LogPrivate {
    private clientLogger;
    constructor(loggerName?: loggerName, config?: Configuration);
    info(info: ClientInfo): void;
    error(info: ClientError): void;
    warn(info: ClientWarn): void;
    configureLog(conf?: Configuration): void;
    emitToClient(event: string, ...args: any): void;
}
export {};
