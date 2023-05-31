import {DataType, DataValue} from 'node-opcua'
import {ClientService} from '../services/client.service'
import {IDbData} from './params.model'

/**
 * @description 定义订阅传递信息并且存入数据库的数据结构
 */
export class UaMessage implements IDbData {
    server: string
    nodeId: string
    displayName: string
    statusCode: string
    sourceTimestamp: string
    serverTimestamp: string
    value: string
    dataType: string

    constructor(dataValue: DataValue, nodeId: string, displayName: string) {
        this.server = ClientService.currentServer
        this.displayName = displayName
        this.nodeId = nodeId.toString()
        this.statusCode = dataValue.statusCode.name.toString()
        this.serverTimestamp = dataValue.serverTimestamp
            ? dataValue.serverTimestamp.toLocaleString()
            : new Date().toLocaleDateString()
        this.sourceTimestamp = dataValue.sourceTimestamp
            ? dataValue.sourceTimestamp.toLocaleString()
            : new Date().toLocaleDateString()
        this.value = dataValue.value.value.toString()
        this.dataType = DataType[dataValue.value.dataType].toString()
    }
}