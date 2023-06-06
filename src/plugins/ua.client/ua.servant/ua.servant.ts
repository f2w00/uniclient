import Koa from 'koa'
import { koaBody } from 'koa-body'
import { Config } from '../config/config.default'
import { ClientRouter } from './routers/client.router'
import { SessionRouter } from './routers/session.router'
import { SubscriptRouter } from './routers/subscript.router'
import { CertificateRouter } from './routers/certificate.router'
import { DbRouter } from './routers/db.router'
import { ErrorMiddleware } from './middlewares/error.middleware'
import { CommunicateUtil, RecordUtil } from './utils/util'
import { parallel } from 'async'
import { Log } from '../../../platform/base/log/log'

export module Server {
    export async function activateServer() {
        const app = new Koa()
        app.use(koaBody())
        app.use(ErrorMiddleware.handleError)
        parallel([
            async () => app.use(ClientRouter.router.routes()),
            async () => app.use(SessionRouter.router.routes()),
            async () => app.use(SubscriptRouter.router.routes()),
            async () => app.use(CertificateRouter.router.routes()),
            async () => app.use(DbRouter.router.routes()),
        ])
        try {
            app.listen(Config.port, () => {
                console.log('complete')
                app.emit('serverCreated', Config.port)
            })
        } catch (e: any) {
            CommunicateUtil.emitToClient('Log.error', [e])
        }
        new Log()
        new CommunicateUtil()
        new RecordUtil()
    }
}
Server.activateServer()
