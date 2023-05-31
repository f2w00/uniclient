import {SubscriptService} from '../services/subscript.service'
import {IRouterParamContext} from 'koa-router'
import {Next, ParameterizedContext} from 'koa'
import {ResponseModel} from '../models/response.model'
import 'koa-body/lib/index'

export module SubscriptController {

    // export let events = new EventEmitter()

    export async function init(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            SubscriptService.createSubscription(ctx.request.body)
            ctx.body = new ResponseModel()
            // events.emit('init', ctx.request.body)
        } catch (e: any) {
            throw e
        }
    }

    export async function modify(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            await SubscriptService.modifySubscription(ctx.request.body)
            ctx.body = new ResponseModel()
            // events.emit('modify', ctx.request.body)
        } catch (e: any) {
            throw e
        }
    }

    export async function addItemGroup(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            SubscriptService.addMonitoredItems(ctx.request.body)
            ctx.body = new ResponseModel()
            // events.emit('add_many', ctx.request.body)
        } catch (e: any) {
            throw e
        }
    }

    export async function addItem(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            SubscriptService.addMonitoredItem(ctx.request.body)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function getItems(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            let items = await SubscriptService.getMonitoredItems()
            ctx.body = new ResponseModel(items)
        } catch (e: any) {
            throw e
        }
    }

    export async function deleteItems(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            await SubscriptService.deleteMonitoredItems(ctx.request.body)
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }

    export async function terminate(
        ctx: ParameterizedContext<any, IRouterParamContext<any, {}>, any>,
        next: Next
    ) {
        try {
            await SubscriptService.terminateSubscription()
            ctx.body = new ResponseModel()
        } catch (e: any) {
            throw e
        }
    }
}