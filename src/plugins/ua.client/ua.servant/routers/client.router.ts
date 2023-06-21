import Router from 'koa-router'

import {ClientController} from '../controllers/client.controller'
import {AgentMiddleware} from '../middlewares/agent.middleware'

export module ClientRouter {
    export let router = new Router({
        prefix: '/client',
    })
    router.use(AgentMiddleware.clientValidator)

    router.post('/init', ClientController.init)
    router.post('/connect', ClientController.connect)
    router.post('/disconnect', ClientController.disconnect)
    router.post('/endpoints', ClientController.getEndpoints)

    router.get('/private_key', ClientController.getPrivateKey)
    router.get('/cert', ClientController.getCertificate)
    router.get('/servers', ClientController.getServers)
    //每次运行首先检查下两项,并且尝试restore
    router.get('/project_info', ClientController.projectInfo)
    router.get('/pki_ready',ClientController.pkiReady)
    router.post('/restore', ClientController.restore)
    router.get('/record_names', ClientController.getRecords)
}
