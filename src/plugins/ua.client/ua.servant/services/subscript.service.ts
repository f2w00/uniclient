import {
    ClientMonitoredItem,
    ClientSubscription,
    ClientSubscriptionOptions,
    ModifySubscriptionOptions,
    TimestampsToReturn,
} from 'node-opcua'
import { SessionService } from './session.service'
import { UaErrors, UaSources, UaWarns } from '../../common/ua.enums'
import { UaMessage } from '../models/message.model'
import { ItemAndName, NodeID, SubscriptGroupParam, SubscriptSingleParam } from '../models/params.model'
import { Config } from '../../config/config.default'
import { ClientError, ClientWarn } from '../../../../platform/base/log/log'
import { CommunicateUtil, RecordUtil } from '../utils/util'

export module SubscriptService {
    export let subscription!: ClientSubscription
    let monitoredItems: Map<string, ItemAndName> = new Map()
    let subscriptionOption = Config.defaultSubscript

    function bindingAndPush(monitoredItem: ClientMonitoredItem, displayName: string, itemId: any) {
        try {
            itemId = itemId.toString()
            monitoredItem
                .on('changed', async (data) => {
                    let item = monitoredItems.get(itemId)
                    if (item) {
                        CommunicateUtil.emitToClient('Broker.receive', [
                            {
                                pipeId: Config.defaultPipeName,
                                messageId: monitoredItem.itemToMonitor.nodeId.toString(),
                                message: new UaMessage(
                                    data,
                                    monitoredItem.itemToMonitor.nodeId.toString(),
                                    item.displayName
                                ),
                            },
                        ])
                    }
                    // Broker.receive(
                    //     Config.defaultPipeName,
                    //     monitoredItem.itemToMonitor.nodeId.toString(),
                    //     new UaMessage(data, monitoredItem.itemToMonitor.nodeId.toString(), item.displayName)
                    // )
                    // await pipe.inPipe(
                    //     monitoredItem.itemToMonitor.nodeId.toString(),
                    //     new UaMessage(data, monitoredItem.itemToMonitor.nodeId.toString(), item.displayName)
                    // )
                })
                .on('err', (err) => {
                    throw new ClientError(UaSources.subscriptService, UaErrors.errorMonitoringItem, err)
                })
            monitoredItems.set(itemId, { monitoredItem: monitoredItem, displayName: displayName })
        } catch (e: any) {
            throw new ClientError(UaSources.subscriptService, UaErrors.errorBinding, e.message, e.stack)
        }
    }

    export function createSubscription(subOptions: ClientSubscriptionOptions = subscriptionOption) {
        try {
            subscription = ClientSubscription.create(SessionService.session, subOptions)
        } catch (e: any) {
            throw new ClientError(UaSources.subscriptService, UaErrors.errorCreatingSub, e.message, e.stack)
        }
    }

    export async function modifySubscription(subOptions: ModifySubscriptionOptions) {
        try {
            await subscription.modify(subOptions)
        } catch (e: any) {
            throw new ClientError(UaSources.subscriptService, UaErrors.errorModifySub, e.message, e.stack)
        }
    }

    export async function terminateSubscription() {
        if (subscription) {
            await subscription.terminate()
        }
    }

    /**
     * @description 用来同时添加多个monitored item
     * @param param
     */
    export function addMonitoredItems(param: SubscriptGroupParam) {
        try {
            param.parameters = param.parameters || { samplingInterval: 100, discardOldest: true, queueSize: 10 }
            param.timeStampToReturn = param.timeStampToReturn || TimestampsToReturn.Both
            if (subscription) {
                for (let i = 0; i < param.itemsToMonitor.length; i++) {
                    let monitoredItem = ClientMonitoredItem.create(
                        subscription,
                        param.itemsToMonitor[i],
                        param.parameters,
                        param.timeStampToReturn
                    )
                    bindingAndPush(monitoredItem, param.displayNames[i], param.itemsToMonitor[i].nodeId)
                }
            } else {
                throw new ClientWarn(UaSources.subscriptService, UaWarns.noSubscription)
            }
        } catch (e: any) {
            throw new ClientError(UaSources.subscriptService, UaErrors.errorAddMonitoredItem, e.message, e.stack)
        }
    }

    /**
     * @description 创建一个监控节点并且加入到本类的节点数组之中
     * @param param
     */
    export function addMonitoredItem(param: SubscriptSingleParam) {
        try {
            param.parameters = param.parameters || { samplingInterval: 100, discardOldest: true, queueSize: 10 }
            param.timeStampToReturn = param.timeStampToReturn || TimestampsToReturn.Both
            let monitoredItem = ClientMonitoredItem.create(
                subscription,
                param.itemToMonitor,
                param.parameters,
                param.timeStampToReturn
            )
            bindingAndPush(monitoredItem, param.displayName, param.itemToMonitor.nodeId)
        } catch (e: any) {
            throw new ClientError(UaSources.subscriptService, UaErrors.errorAddMonitoredItem, e.message, e.stack)
        }
    }

    export async function getMonitoredItems() {
        if (subscription) {
            return await subscription.getMonitoredItems()
        }
    }

    /**
     * @description monitored items 队列使用map作为存储结构,以nodeId的string作为键
     * @param nodeIds
     */
    export async function deleteMonitoredItems(nodeIds: NodeID[]) {
        try {
            for (let nodeId of nodeIds) {
                let item = monitoredItems.get(nodeId)
                if (item) {
                    await item.monitoredItem.terminate()
                    monitoredItems.delete(nodeId)
                } else {
                    throw new ClientWarn(UaSources.subscriptService, UaWarns.nonExistentItem, nodeId)
                }
            }
        } catch (e: any) {
            throw new ClientError(UaSources.subscriptService, UaErrors.wrongIndexOfArray, e.message, e.stack)
        }
    }

    export function record() {
        let results: { itemToMonitor: string; displayName: string }[] = []
        monitoredItems.forEach((value, key) => {
            results.push({
                itemToMonitor: value.monitoredItem.itemToMonitor.nodeId.toString(),
                displayName: value.displayName,
            })
        })
        results.length > 0 ? RecordUtil.recordParams('subscript:items', { items: results }) : null
    }
}
