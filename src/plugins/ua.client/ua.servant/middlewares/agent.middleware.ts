import { Next, ParameterizedContext } from 'koa'
import { IRouterParamContext } from 'koa-router'
import {
    BrowseDescriptionLike,
    ClientSubscriptionOptions,
    HistoryReadRequest,
    ModifySubscriptionOptions,
    OPCUAClientOptions,
    ReadValueIdOptions,
    UserIdentityInfo,
    WriteValueOptions,
} from 'node-opcua'
import 'koa-body/lib/index'
import { is } from 'typia'
import { TableCreateModes, UaErrors, UaInfos, UaSources } from '../../common/ua.enums'
import {
    EndpointParam,
    HistoryValueParam,
    IDbData,
    IFieldNames,
    NodeID,
    SubscriptGroupParam,
    SubscriptSingleParam,
} from '../models/params.model'
import { CreateSelfSignCertificateParam1 } from 'node-opcua-pki'
import { Certificate } from 'node-opcua-crypto'
import { CertUtils, CommunicateUtil, DbUtils, RecordUtil } from '../utils/util'
const { LogPrivate } = require('uniclient/base/log/log.js')
const { appDataPath } = require('uniclient/base/paths')

type Source = string | undefined
type Warn = string
type Error = string
type Info = string

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
 * @description 检查参数/日志登记/记录参数
 */
export module AgentMiddleware {
    export const Log = new LogPrivate('uaclient', {
        appenders: {
            uaclient: {
                type: 'file',
                filename: appDataPath + '/logs/uaclient.log',
                maxLogSize: 20000, //文件最大存储空间，当文件内容超过文件存储空间会自动生成一个文件test.log.1的序列自增长的文件
            },
        },
        categories: { default: { appenders: ['uaclient'], level: 'info' } },
    })

    export async function clientValidator(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        switch (ctx.request.path) {
            case '/client/init': {
                ctx.request.body
                if (is<OPCUAClientOptions | undefined>(ctx.request.body)) {
                    RecordUtil.recordParams('client:init', ctx.request.body)
                    Log.info(new ClientInfo(UaSources.clientService, UaInfos.clientCreated, { ...ctx.request.body }))
                    await next()
                } else {
                    throw validateError('OPCUAClientOptions | undefined')
                }
                break
            }
            case '/client/connect': {
                if (is<{ endpointUrl: string }>(ctx.request.body)) {
                    RecordUtil.recordParams('client:connect', ctx.request.body)
                    Log.info(
                        new ClientInfo(UaSources.clientService, UaInfos.connectionCreated, { ...ctx.request.body })
                    )
                    await next()
                } else {
                    throw validateError('{ endpointUrl: string }')
                }
                break
            }
            case '/client/endpoints': {
                if (is<EndpointParam | undefined>(ctx.request.body)) {
                    Log.info(
                        new ClientInfo(UaSources.clientService, UaInfos.connectionCreated, { ...ctx.request.body })
                    )
                    await next()
                } else {
                    throw validateError('{ endpointUrl: string }')
                }
                break
            }
            case '/client/disconnect': {
                if (is<{ deleteSubscription: boolean } | undefined>(ctx.request.body)) {
                    Log.info(new ClientInfo(UaSources.clientService, UaInfos.sessionClosed))
                    Log.info(new ClientInfo(UaSources.clientService, UaInfos.clientDisconnect))
                    await next()
                } else {
                    throw validateError('{ deleteSubscription: boolean } | {}')
                }
                break
            }
            case '/client/private_key': {
                Log.info(new ClientInfo(UaSources.clientService, UaInfos.getPrivateKey))
                await next()
                break
            }
            case 'client/cert': {
                Log.info(new ClientInfo(UaSources.clientService, UaInfos.getCertificate))
                await next()
                break
            }
            default:
                await next()
        }
    }

    export async function sessionValidator(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        switch (ctx.request.body) {
            case '/session/init': {
                if (is<UserIdentityInfo | undefined>(ctx.request.body)) {
                    RecordUtil.recordParams('session:init', ctx.request.body)
                    Log.info(new ClientInfo(UaSources.sessionService, UaInfos.sessionCreated))
                    await next()
                } else {
                    throw validateError('UserIdentityInfo | undefined')
                }
                break
            }
            case '/session/change_identity': {
                if (is<UserIdentityInfo>(ctx.request.body)) {
                    RecordUtil.recordParams('session:init', ctx.request.body)
                    await next()
                } else {
                    throw validateError('UserIdentityInfo')
                }
                break
            }
            case '/session/close': {
                if (is<{ deleteSubscription: boolean } | undefined>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('{ deleteSubscription: boolean } | undefined')
                }
                break
            }
            case '/session/read': {
                if (is<ReadValueIdOptions>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('ReadValueIdOptions')
                }
                break
            }
            case '/session/id': {
                if (is<{ path: string }>(ctx.query)) {
                    Log.info(new ClientInfo(UaSources.sessionService, UaInfos.getIdByName, { ...ctx.request.body }))
                    await next()
                } else {
                    throw validateError('{ path: string }')
                }
                break
            }
            case '/session/write': {
                if (is<WriteValueOptions>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('WriteValueOptions')
                }
                break
            }
            case '/session/browse': {
                if (is<{ node: BrowseDescriptionLike; browseNext: boolean }>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('{ nodes: BrowseDescriptionLike, browseNext: boolean }')
                }
                break
            }
            case '/session/history': {
                if (is<HistoryReadRequest>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('HistoryReadRequest')
                }
                break
            }
            case '/session/history/value': {
                if (is<HistoryValueParam>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('HistoryValueParam')
                }
                break
            }
            default:
                await next()
        }
    }

    export async function subscriptValidator(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        switch (ctx.request.path) {
            case '/subscript/init': {
                if (is<ClientSubscriptionOptions | undefined>(ctx.request.body)) {
                    Log.info(new ClientInfo(UaSources.subscriptService, UaInfos.installedSub))
                    RecordUtil.recordParams('subscript:init', ctx.request.body)
                    await next()
                } else {
                    throw validateError('ClientSubscriptionOptions')
                }
                break
            }
            case '/subscript/modify': {
                if (is<ModifySubscriptionOptions>(ctx.request.body)) {
                    Log.info(
                        new ClientInfo(UaSources.subscriptService, UaInfos.modifySubscription, { ...ctx.request.body })
                    )
                    RecordUtil.recordParams('subscript:init', ctx.request.body)
                    await next()
                } else {
                    throw validateError('ModifySubscriptionOptions')
                }
                break
            }
            case '/subscript/item/group': {
                if (is<SubscriptGroupParam>(ctx.request.body)) {
                    Log.info(
                        new ClientInfo(UaSources.subscriptService, UaInfos.monitoredItemInit, { ...ctx.request.body })
                    )
                    await next()
                } else {
                    throw validateError('SubscriptGroupParam')
                }
                break
            }
            case '/subscript/item/single': {
                if (is<SubscriptSingleParam>(ctx.request.body)) {
                    Log.info(
                        new ClientInfo(UaSources.subscriptService, UaInfos.monitoredItemInit, {
                            ...ctx.request.body,
                        })
                    )
                    await next()
                } else {
                    throw validateError('SubscriptSingleParam')
                }
                break
            }
            case '/subscript/item/delete': {
                if (is<NodeID[]>(ctx.request.body)) {
                    Log.info(
                        new ClientInfo(UaSources.subscriptService, UaInfos.monitoredItemTerminate, {
                            ...ctx.request.body,
                        })
                    )
                    await next()
                } else {
                    throw validateError('NodeID[]')
                }
                break
            }
            case '/subscript/terminate': {
                // CommunicateUtil.emitToClient('Log.info', [
                //     new ClientInfo(UaSources.subscriptService, UaInfos.terminateSub),
                // ])
                Log.info(new ClientInfo(UaSources.subscriptService, UaInfos.terminateSub))
                await next()
                break
            }
            default:
                await next()
        }
    }

    export async function certValidator(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        switch (ctx.request.body) {
            case '/cert/create': {
                if (is<CreateSelfSignCertificateParam1>(ctx.request.body)) {
                    if (CertUtils.validateCertOptions(ctx.request.body)) {
                        // CommunicateUtil.emitToClient('Log.info', [
                        //     new ClientInfo(UaSources.paramValidator, UaInfos.certCreated),
                        // ])
                        Log.info(new ClientInfo(UaSources.paramValidator, UaInfos.certCreated))
                        await next()
                    } else {
                        throw new ClientError(UaSources.paramValidator, UaErrors.errorCertOptions, 'country too long')
                    }
                } else {
                    throw validateError('CreateSelfSignCertificateParam1')
                }
                break
            }
            case '/cert/trust_status' || '/cert/trust' || '/cert/reject': {
                if (is<Certificate>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('Buffer')
                }
                break
            }
            default:
                await next()
        }
    }

    export async function dbValidator(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        switch (ctx.request.body) {
            /**
             * @description 此处绑定了pipe的事件,并且当
             */
            case '/db/init': {
                if (is<{ createMode: TableCreateModes; tableName?: string; fields?: IFieldNames }>(ctx.request.body)) {
                    DbUtils.validateDbName(ctx.request.body['tableName'])
                    RecordUtil.recordParams('db:init', ctx.request.body)
                    await next()
                } else {
                    throw validateError('{createMode:TableCreateModes, tableName?:string, fields:IFieldNames}')
                }
                break
            }
            case '/db/insert': {
                if (is<IDbData>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('IDbData')
                }
                break
            }
            case '/db/insert_many': {
                if (is<IDbData[]>(ctx.request.body)) {
                    await next()
                } else {
                    throw validateError('IDbData[]')
                }
                break
            }
            case '/db/create_table': {
                if (is<{ tableName?: string; fieldNames?: IFieldNames } | undefined>(ctx.request.body)) {
                    if (ctx.request.body) {
                        if ('tableName' in ctx.request.body) {
                            if (!DbUtils.validateDbName(ctx.request.body['tableName'] as string)) {
                                throw new ClientError(
                                    UaSources.paramValidator,
                                    UaErrors.unFormatDbName,
                                    'It cannot start with a number. The name can only contain: ' +
                                        'Chinese characters, numbers, lowercase letters, underscores, and the length is within 2-15 characters'
                                )
                            }
                        }
                        if ('fieldNames' in ctx.request.body && ctx.request.body['fieldNames']) {
                            let key: keyof IFieldNames
                            for (key in ctx.request.body['fieldNames']) {
                                if (!DbUtils.validateDbName(ctx.request.body['fieldNames'][key])) {
                                    throw new ClientError(
                                        UaSources.paramValidator,
                                        UaErrors.unFormatDbName,
                                        'It cannot start with a number. The name can only contain: ' +
                                            'Chinese characters, numbers, lowercase letters, underscores, and the length is within 2-15 characters'
                                    )
                                }
                            }
                        }
                    }
                    await next()
                } else {
                    throw validateError('{ tableName?: string, fieldNames?: IFieldNames } | undefined')
                }
                break
            }
            default:
                await next()
        }
    }

    function validateError(paramType: any) {
        return new ClientError(UaSources.paramValidator, UaErrors.errorValidateParam, `Supposed to be ${paramType}`)
    }
}
