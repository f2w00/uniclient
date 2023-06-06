import { ClientService } from '../services/client.service'
import { ResponseModel } from '../models/response.model'
import { Next, ParameterizedContext } from 'koa'
import { IRouterParamContext } from 'koa-router'
import 'koa-body/lib/index'
import { Config } from '../../config/config.default'

export module ClientController {
    export async function init(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let clientOptions = ctx.request.body
            ClientService.createClient(clientOptions)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function connect(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let param = ctx.request.body
            if (param['endpointUrl']) {
                let endpointUrl = param['endpointUrl']
                await ClientService.connectToServer(endpointUrl)
                ctx.body = new ResponseModel()
            }
        } catch (e: any) {
            throw e
        }
    }

    export async function disconnect(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let deleteSubscription = ctx.request.body['deleteSubscription']
            await ClientService.disconnectFromServer(deleteSubscription)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function getEndpoints(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            let endpoints = await ClientService.getEndpoints(ctx.request.body)
            ctx.body = new ResponseModel(endpoints)
        } catch (e: any) {
            throw e
        }
    }

    export async function getPrivateKey(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            ctx.body = ClientService.getPrivateKey()
        } catch (e: any) {
            throw e
        }
    }

    export async function getCertificate(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            ctx.body = new ResponseModel(ClientService.getClientCert())
        } catch (e: any) {
            throw e
        }
    }

    export async function getServers(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        try {
            ctx.body = new ResponseModel(ClientService.getServersOnNetwork())
        } catch (e: any) {
            throw e
        }
    }

    export async function restore(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        const { existsSync } = require('fs')
        const { RecordUtil } = require('../utils/util')
        let fileName = Config.recordJsonFilePath + ctx.request.body['recordName']
        let record = undefined
        if (existsSync(fileName)) {
            record = RecordUtil.restoreRecordFromJson(fileName)
        }
        ctx.body = new ResponseModel(RecordUtil.restoreRecordFromJson(record))
    }

    export async function getRecords(ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>, next: Next) {
        const { readdirSync } = require('fs')
        const { join } = require('path')
        let results = readdirSync(join(__dirname, '../records'))
        let result: string[] = []
        results.forEach((value: string, index: number) => {
            if (value.endsWith('.json')) {
                result.push(value)
            }
        })
        ctx.body = new ResponseModel(result)
    }
}
