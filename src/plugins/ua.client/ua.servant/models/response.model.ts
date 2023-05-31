import {ServerMessage, ServerStatusCodes} from '../../common/ua.enums'

/**
 * @description 用来统一response的格式,默认成功
 */
export class ResponseModel {
    code: ServerStatusCodes
    message: string
    data?: any

    /**
     * @description message和code默认为success和200
     * @param data
     * @param message
     * @param code
     */
    constructor(data?: any, message: string = ServerMessage.success, code: number = ServerStatusCodes.success) {
        this.code = code
        this.message = message
        this.data = data
    }
}