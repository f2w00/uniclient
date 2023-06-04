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

export module Server {
    export const app = new Koa()
    let routers = [
        ClientRouter.router,
        SessionRouter.router,
        SubscriptRouter.router,
        CertificateRouter.router,
        DbRouter.router,
    ]

    export function activateServer() {
        let projectFileName = ''
        app.use(koaBody())
        app.use(ErrorMiddleware.handleError)
        routers.forEach((router) => {
            app.use(router.routes())
        })
        // CommunicateUtil.emitToClient('Workspace.getProjectFileName', ['uaclient'])
        // CommunicateUtil.events.on('project:fileName', (message: string) => {
        //     projectFileName = message
        //     let configure = Config.createLogConfigure(message)
        //     CommunicateUtil.emitToClient('Log.configure', [configure])
        // })
        try {
            app.listen(Config.port, () => {
                console.log('complete')
                app.emit('serverCreated', Config.port)
            })
        } catch (e: any) {
            CommunicateUtil.emitToClient('Log.error', [e])
        }
        new RecordUtil()
        console.log(process.env)
    }
}
Server.activateServer()
