import { FindServersOnNetworkRequestOptions, MessageSecurityMode, OPCUAClient, OPCUAClientOptions } from 'node-opcua'
import { UaErrors, UaSources, UaWarns } from '../../common/ua.enums'
import { SessionService } from './session.service'
import { Config } from '../../config/config.default'
import { EndpointParam } from '../models/params.model'
import { ClientError, ClientWarn } from '../../../../platform/base/log/log'

export module ClientService {
    export let client!: OPCUAClient
    export let uaConnectionAlive: boolean = false
    export let currentServer: string = 'No Server'
    let clientOption = Config.defaultClient

    export function createClient(clientOptions: OPCUAClientOptions = clientOption) {
        try {
            client = OPCUAClient.create(clientOptions)
        } catch (e: any) {
            throw new ClientError(UaSources.clientService, UaErrors.errorCreateClient, e.message, e.stack)
        }
    }

    export async function connectToServer(endpointUrl: string) {
        try {
            await client.connect(endpointUrl)
            uaConnectionAlive = true
        } catch (e: any) {
            throw new ClientError(UaSources.clientService, UaErrors.errorConnecting, e.message, e.stack)
        }
    }

    export async function disconnectFromServer(deleteSubscription: boolean = true) {
        if (SessionService.session) {
            try {
                await SessionService.closeSession(deleteSubscription)
                uaConnectionAlive = false
            } catch (e: any) {
                throw new ClientError(UaSources.clientService, UaErrors.errorClosingSession, e.message, e.stack)
            }
        }
        await client.disconnect()
    }

    //todo 测试此项
    export async function getServersOnNetwork(options?: FindServersOnNetworkRequestOptions) {
        try {
            let servers = await client.findServersOnNetwork(options)
            if (!servers) throw new ClientWarn(UaSources.clientService, UaWarns.serversNotExist)
            return servers
        } catch (e: any) {
            throw new ClientError(UaSources.clientService, UaErrors.errorGetServers, e.message, e.stack)
        }
    }

    export async function getEndpoints(params?: EndpointParam) {
        try {
            if (params && params['clientExist'] === false && params['endpoint']) {
                client = OPCUAClient.create(clientOption)
                await connectToServer(params['endpoint'])
            }
            let endpoints = await client.getEndpoints()
            if (!endpoints) throw new ClientWarn(UaSources.clientService, UaWarns.endPointsNotExist)
            if (params && params['reduce']) {
                let re = /^.*?#/
                return endpoints.map((endpoint) => ({
                    endpointUrl: endpoint.endpointUrl,
                    securityMode: MessageSecurityMode[endpoint.securityMode].toString(),
                    securityPolicy: endpoint.securityPolicyUri
                        ? endpoint.securityPolicyUri.toString().replace(re, '')
                        : undefined,
                }))
            } else {
                return endpoints
            }
        } catch (e: any) {
            throw new ClientError(UaSources.clientService, UaErrors.errorGetEndpoints, e.message, e.stack)
        }
    }

    export function getPrivateKey() {
        return client.getPrivateKey()
    }

    export function getClientCert() {
        return client.getCertificate()
    }
}

async function f() {
    await ClientService.connectToServer('a')
}

// f()
