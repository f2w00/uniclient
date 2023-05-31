export namespace rendererEvents {
    export enum benchEvents {
        minimize = 'render:bench.mini',
        maximize = 'render:bench.max',
        close = 'render:bench.close',
        quit = 'render:bench.quit',
    }

    export enum extensionEvents {
        install = 'render:extension.install',
        uninstall = 'render:extension.uninstall',
        activate = 'render:extension.activate',
    }

    export enum workspaceEvents {
        create = 'render:workspace.create',
    }

    export enum persistEvents {
        init = 'render:persist.init',
    }

    export enum viewEvents {
        closeAll = 'render:view.closeAll',
    }

    export enum logEvents {
        info = 'render:log.info',
        error = 'render:log.error',
        warn = 'render:log.warn',
    }
}

export namespace MainEvents {
    export enum logEmitEvents {
        error = 'main:log.error',
        info = 'main:log.info',
        warn = 'main:log.warn',
    }
}
