export declare namespace renderEvents {
    enum benchEvents {
        minimize = "render:bench.mini",
        maximize = "render:bench.max",
        close = "render:bench.close",
        quit = "render:bench.quit",
        beforeClose = "render:beforeClose",
        clientInfo = "render:client.info"
    }
    enum extensionEvents {
        install = "render:extension.install",
        uninstall = "render:extension.uninstall",
        activate = "render:extension.activate",
        onStart = "render:extension.onStart",
        getInfo = "render:extension.info"
    }
    enum workspaceEvents {
        create = "render:workspace.create",
        load = "render:workspace.load",
        projectLoad = "render:project.load",
        projectCreate = "render:project.create",
        openFolder = "render:folder.open"
    }
    enum persistEvents {
        init = "render:persist.init",
        insert = "render:persist.insert",
        insertMany = "render:persist.insertMany",
        remove = "render:persist.remove",
        update = "render:persist.update"
    }
    enum viewEvents {
        closeAll = "render:view.closeAll"
    }
    enum logEvents {
        info = "render:log.info",
        error = "render:log.error",
        warn = "render:log.warn"
    }
    enum storeEvents {
        store = "render:store"
    }
}
export declare namespace MainEmitEvents {
    enum logEmitEvents {
        error = "main:log.error",
        info = "main:log.info",
        warn = "main:log.warn",
        notice = "main:notice"
    }
}
export declare namespace LocalEvents {
    enum innerEvents {
        loadedExtension = "extension:loaded",
        extensionClosed = "extension:closed",
        completeLoading = "client:start.complete",
        completeClose = "client:close.complete",
        sendIpc = "sendToIpc",
        loadProject = "project:load"
    }
}
