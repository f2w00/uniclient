import Router from 'koa-router'
import { CertificateController } from '../controllers/certificate.controller'
import { AgentMiddleware } from '../middlewares/agent.middleware'

export module CertificateRouter {
    export let router = new Router({
        prefix: '/cert',
    })
    router.use(AgentMiddleware.certValidator)

    router.post('/create', CertificateController.create)
    router.post('/trust', CertificateController.trust)
    router.post('/reject', CertificateController.reject)
    router.post('/trust_status', CertificateController.getTrustStatus)
}
