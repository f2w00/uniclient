import Router from 'koa-router'
import { SubscriptController } from '../controllers/subscript.controller'
import { AgentMiddleware } from '../middlewares/agent.middleware'

export module SubscriptRouter {
    export let router = new Router({
        prefix: '/subscript',
    })
    router.use(AgentMiddleware.subscriptValidator)

    router.post('/init', SubscriptController.init)
    router.post('/modify', SubscriptController.modify)
    router.post('/item/group', SubscriptController.addItemGroup)
    router.post('/item/single', SubscriptController.addItem)
    router.post('/item/delete', SubscriptController.deleteItems)
    router.get('/terminate', SubscriptController.terminate)
}
