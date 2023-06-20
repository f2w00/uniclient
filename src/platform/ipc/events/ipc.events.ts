export namespace renderEvents {
    export enum benchEvents {
        minimize = 'render:bench.mini',
        maximize = 'render:bench.max',
        close = 'render:bench.close',
        quit = 'render:bench.quit',
        beforeClose = 'render:beforeClose',
        clientInfo = 'render:client.info',
    }

    export enum extensionEvents {
        install = 'render:extension.install',
        uninstall = 'render:extension.uninstall',
        activate = 'render:extension.activate',
        onStart = 'render:extension.onStart',
        getInfo = 'render:extension.info',
    }

    export enum workspaceEvents {
        create = 'render:workspace.create',
        load = 'render:workspace.load',
        projectLoad = 'render:project.load',
        projectCreate = 'render:project.create',
        openFolder = 'render:folder.open',
    }

    export enum persistEvents {
        init = 'render:persist.init',
        insert = 'render:persist.insert',
        insertMany = 'render:persist.insertMany',
        remove = 'render:persist.remove',
        update = 'render:persist.update',
    }

    export enum viewEvents {
        closeAll = 'render:view.closeAll',
    }

    export enum logEvents {
        info = 'render:log.info',
        error = 'render:log.error',
        warn = 'render:log.warn',
    }

    export enum storeEvents {
        store = 'render:store',
    }
}

export namespace MainEmitEvents {
    export enum logEmitEvents {
        error = 'main:log.error',
        info = 'main:log.info',
        warn = 'main:log.warn',
        notice = 'main:notice',
    }
}

export namespace LocalEvents {
    export enum innerEvents {
        loadedExtension = 'extension:loaded',
        extensionClosed = 'extension:closed',
        completeLoading = 'client:start.complete',
        completeClose = 'client:close.complete',
        sendIpc = 'sendToIpc',
        loadProject = 'project:load',
    }
}
