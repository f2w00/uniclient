import {SessionService} from '../services/session.service'
import {Next, ParameterizedContext} from 'koa'
import {IRouterParamContext} from 'koa-router'
import {ResponseModel} from '../models/response.model'
import {ReadValueIdOptions, UserIdentityInfo} from 'node-opcua'
import 'koa-body/lib/index'

export module SessionController {

    export async function init(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let userInfo: UserIdentityInfo | undefined = ctx.request.body
            await SessionService.createSession(userInfo)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function changeIdentity(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let userInfo: UserIdentityInfo = ctx.request.body
            await SessionService.changeIdentity(userInfo)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function close(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let param = ctx.request.body
            'deleteSubscription' in param
                ? await SessionService.closeSession(param['deleteSubscription'])
                : await SessionService.closeSession()
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function readById(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let node: ReadValueIdOptions = ctx.request.body
            ctx.body = new ResponseModel(await SessionService.readByNodeId(node))
        } catch (e: any) {
            throw e
        }
    }

    export async function getIdByName(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let param = ctx.query
            if (param && 'path' in param) {
                // @ts-ignore
                let path: string = param['path'].toString()
                let result = await SessionService.getNodeIdByBrowseName(path)
                ctx.body = new ResponseModel(result)
            }
        } catch (e: any) {
            throw e
        }
    }

    export async function write(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let param = ctx.request.body
            await SessionService.writeToServer(param)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function browseRoot(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let result = await SessionService.browseRootFolder()
            ctx.body = new ResponseModel(result)
        } catch (e: any) {
            throw e
        }
    }

    export async function browse(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let result = await SessionService.browse(ctx.request.body['node'], ctx.request.body['browseNext'])
            ctx.body = new ResponseModel(result)
        } catch (e: any) {
            throw e
        }
    }

    export async function serverCert(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            ctx.body = new ResponseModel(SessionService.serverCert())
        } catch (e: any) {
            throw e
        }
    }

    export async function history(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            await SessionService.historyRead(ctx.request.body)
            ctx.body = new ResponseModel(SessionService.serverCert())
        } catch (e: any) {
            throw e
        }
    }

    export async function historyValue(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            await SessionService.readHistoryValue(ctx.request.body)
            ctx.body = new ResponseModel(SessionService.serverCert())
        } catch (e: any) {
            throw e
        }
    }
}