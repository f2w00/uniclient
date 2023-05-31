import {ClientMonitoredItem, MonitoringParametersOptions, ReadValueIdOptions, TimestampsToReturn} from 'node-opcua'
import {NodeIdLike} from 'node-opcua-nodeid'
import {DateTime} from 'node-opcua-basic-types'
import {ExtraReadHistoryValueParameters, HistoryReadValueIdOptions2} from 'node-opcua-client/source/client_session'

export interface SubscriptSingleParam {
    itemToMonitor: ReadValueIdOptions,
    displayName: string,
    timeStampToReturn?: TimestampsToReturn,
    parameters?: MonitoringParametersOptions,
}

export interface SubscriptGroupParam {
    itemsToMonitor: ReadValueIdOptions[],
    displayNames: string[],
    timeStampToReturn?: TimestampsToReturn,
    parameters?: MonitoringParametersOptions,
}

export interface ItemAndName {
    displayName: string
    monitoredItem: ClientMonitoredItem
}

export interface IFieldNames {
    serverF: string
    nodeIdF: string
    displayNameF: string
    statusCodeF: string
    sourceTimestampF: string
    serverTimestampF: string
    valueF: string
    dataTypeF: string
}

export interface IDbData {
    server: string
    nodeId: string
    displayName: string
    value: string
    dataType: string
    sourceTimestamp: string
    serverTimestamp: string
    statusCode: string
}

export interface IDbParam {
    values: IDbData,
    tableName?: string,
    /**
     * @default {
     *     serverF:'Server',
     *     nodeIdF:'NodeId',
     *     displayNameF:'DisplayName',
     *     serverTimeStampF:'ServerTimeStamp',
     *     sourceTimeStampF:'SourceTimeStamp',
     *     statusCodeF:'StatusCode',
     *     dataTypeF:'DataType',
     *     valueF:'Value'
     * }
     */
    fieldNames?: IFieldNames
}

export interface EndpointParam {
    reduce?: boolean,
    clientExist?: boolean,
    endpoint?: string
}

export interface HistoryValueParam {
    nodeToRead: NodeIdLike | HistoryReadValueIdOptions2,
    start: DateTime,
    end: DateTime,
    options?: ExtraReadHistoryValueParameters
}

export type NodeID = string