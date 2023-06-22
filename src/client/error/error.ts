type ErrorListenerCallback = {
    (error: any): void
}

export class ErrorHandler {
    static errorHandler: (error: any) => void
    static rejectionHandler: (rejection: any) => void
    static listeners: ErrorListenerCallback[] = []

    static reportError(error: any) {
        ErrorHandler.errorHandler(error)
    }

    static reportRejection(rejection: any) {
        ErrorHandler.rejectionHandler(rejection)
    }

    static addListener(listener: ErrorListenerCallback) {
        ErrorHandler.listeners.push(listener)
    }

    static setUnexpectedErrorHandler(newHandler: (e: any) => void) {
        ErrorHandler.errorHandler = newHandler
        process.on('uncaughtException', (error) => {
            ErrorHandler.errorHandler(error)
        })
    }

    static setUnhandledRejection(newHandler: (e: any) => void) {
        ErrorHandler.rejectionHandler = newHandler
        process.on('unhandledRejection', newHandler)
    }

    static currentHandler() {
        return ErrorHandler.errorHandler
    }
}
