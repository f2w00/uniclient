import Router from 'koa-router'
import { SessionController } from '../controllers/session.controller'
import { AgentMiddleware } from '../middlewares/agent.middleware'

export module SessionRouter {
    export let router = new Router({ prefix: '/session' })
    router.use(AgentMiddleware.sessionValidator)

    router.post('/init', SessionController.init)
    router.post('/change_identity', SessionController.changeIdentity)
    router.post('/write', SessionController.write)
    router.post('/read', SessionController.readById)
    router.post('/browse', SessionController.browse)
    router.post('/history', SessionController.history)
    router.post('/history/value', SessionController.historyValue)

    router.get('/id', SessionController.getIdByName)
    router.get('/browse/root', SessionController.browseRoot)
    router.get('/server_cert', SessionController.serverCert)

    router.post('/close', SessionController.close)
}
