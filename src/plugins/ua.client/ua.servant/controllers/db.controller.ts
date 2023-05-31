import {IRouterParamContext} from 'koa-router'
import {Next, ParameterizedContext} from 'koa'
import {DbService} from '../services/db.service'
import {ResponseModel} from '../models/response.model'
import {TableCreateModes} from '../../common/ua.enums'
import 'koa-body/lib/index'

export module DbController {
    export async function init(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let {createMode, tableName, fields} = ctx.request.body
            DbService.init(createMode, tableName, fields)
            ctx.body = new ResponseModel(TableCreateModes[createMode])
        } catch (e: any) {
            throw e
        }
    }

    export async function insert(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            DbService.insert(ctx.request.body)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function insertMany(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            DbService.insertMany(ctx.request.body)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function createTable(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            DbService.createTable(ctx.request.body['tableName'], ctx.request.body['fieldNames'])
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }
}