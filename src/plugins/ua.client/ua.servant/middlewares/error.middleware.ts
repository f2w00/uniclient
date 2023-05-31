import {ServerMessage, ServerStatusCodes, UaErrors, UaSources} from '../../common/ua.enums'
import {Next, ParameterizedContext} from 'koa'
import {IRouterParamContext} from 'koa-router'
import {ResponseModel} from '../models/response.model'
import {ClientError, ClientWarn} from './agent.middleware'
import {CommunicateUtil} from '../utils/util'

export module ErrorMiddleware {
    export async function handleError(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            await next()
        } catch (e: any) {
            if (e instanceof ClientWarn) {
                CommunicateUtil.emitToClient('Log.warn', [e])
                ctx.body = new ResponseModel(e, ServerMessage.warn, ServerStatusCodes.success)
            } else if (e instanceof ClientError) {
                CommunicateUtil.emitToClient('Log.error', [e])
                ctx.body = new ResponseModel(e, ServerMessage.error, ServerStatusCodes.internalError)
            } else {
                let err = new ClientError(UaSources.server, UaErrors.internalError, e.message)
                CommunicateUtil.emitToClient('Log.error', [err])
                ctx.body = new ResponseModel(err, ServerMessage.error, ServerStatusCodes.internalError)
            }
        }
    }
}
