import { ServerMessage, ServerStatusCodes, UaErrors, UaSources } from '../../common/ua.enums'
import { Next, ParameterizedContext } from 'koa'
import { IRouterParamContext } from 'koa-router'
import { ResponseModel } from '../models/response.model'
import { AgentMiddleware, ClientError, ClientWarn } from './agent.middleware'

export module ErrorMiddleware {
    export async function handleError(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            await next()
        } catch (e: any) {
            if (e instanceof ClientWarn) {
                AgentMiddleware.Log.warn(e)
                ctx.body = new ResponseModel(e, ServerMessage.warn, ServerStatusCodes.success)
            } else if (e instanceof ClientError) {
                console.log(e)
                AgentMiddleware.Log.error(e)
                ctx.body = new ResponseModel(e, ServerMessage.error, ServerStatusCodes.internalError)
            } else {
                console.log(e)
                let err = new ClientError(UaSources.server, UaErrors.internalError, e.message)
                AgentMiddleware.Log.error(err)
                ctx.body = new ResponseModel(err, ServerMessage.error, ServerStatusCodes.internalError)
            }
        }
    }
}
