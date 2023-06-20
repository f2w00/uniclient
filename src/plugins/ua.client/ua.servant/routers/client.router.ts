import Router from 'koa-router'

import { ClientController } from '../controllers/client.controller'
import { AgentMiddleware } from '../middlewares/agent.middleware'

export module ClientRouter {
    export let router = new Router({
        prefix: '/client',
    })
    router.use(AgentMiddleware.clientValidator)

    router.post('/init', ClientController.init)
    router.post('/connect', ClientController.connect)
    router.post('/disconnect', ClientController.disconnect)
    router.post('/endpoints', ClientController.getEndpoints)
    router.post('/restore', ClientController.restore)

    router.get('/private_key', ClientController.getPrivateKey)
    router.get('/cert', ClientController.getCertificate)
    router.get('/servers', ClientController.getServers)
    router.get('/record_names', ClientController.getRecords)
}
