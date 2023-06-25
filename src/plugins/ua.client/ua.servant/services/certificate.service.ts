import {OPCUACertificateManager} from 'node-opcua'
import {CreateSelfSignCertificateParam1} from 'node-opcua-pki'
import {Certificate} from 'node-opcua-crypto'
import {UaErrors, UaSources} from '../../common/ua.enums'

const {ClientError} = require('uniclient')
const {appDataPath} = require('uniclient')
const {StorePrivate} = require('uniclient')

export module CertificateService {
    export let certificate = new OPCUACertificateManager({
                                                             rootFolder: appDataPath + '/node-cert',
                                                             name: 'pki',
                                                             automaticallyAcceptUnknownCertificate: true,
                                                         })
    certificate.initialize()

    /**
     * @description 创建一个证书,dns即domain names,默认证书根文件夹为项目根目录,
     * 默认pem文件存放路径为certificatees/PKI/own/cert/client_cert.pem
     * validity为有效时间
     * 具体请转到CreateSelfSignCertificateParam1声明处查看
     * @example
     * {
     *    "outputFile": path.join(FileTransfer.dirname(import.meta.url), '..', '..', '..','certificates/PKI/own/certs/client_cert.pem'),
     *    "subject": {
     *       "commonName": "UaExpert@WIN-4D29EPFU0V6",
     *       "organization": "uaclient",
     *       "organizationalUnit": "uaclient",
     *       "locality": "mas",
     *       "state": "ah",
     *       "country": "cn",
     *       "domainComponent": "cn"
     *    },
     *    "applicationUri": "uaclient",
     *    "dns": ["WIN-4D29EPFU0V6"],
     *    "startDate": new Date(),
     *    "validity": 10
     * }
     * @param params
     */
    export async function createCertificate(params: CreateSelfSignCertificateParam1) {
        try {
            params.startDate = new Date(params.startDate)
            params.outputFile = appDataPath + '/cert/' + params.outputFile
            await certificate.createSelfSignedCertificate({ ...params })
            StorePrivate.set('pkiReady', true)
        } catch (e: any) {
            throw new ClientError(UaSources.certService, UaErrors.errorCreatCert, e.message, e.stack)
        }
    }

    export async function trustServerCertificate(serverCertificate: Certificate) {
        try {
            await certificate.trustCertificate(serverCertificate)
        } catch (e: any) {
            throw new ClientError(UaSources.certService, UaErrors.errorTrustCert, e.message, e.stack)
        }
    }

    export async function rejectServerCertificate(serverCertificate: Certificate) {
        try {
            await certificate.rejectCertificate(serverCertificate)
        } catch (e: any) {
            throw new ClientError(UaSources.certService, UaErrors.errorRejectCert, e.message, e.stack)
        }
    }

    /**
     * @description 返回server证书的信任状态
     * @param serverCertificate
     */
    export async function getTrustStatus(serverCertificate: Certificate) {
        try {
            return await certificate.getTrustStatus(serverCertificate)
        } catch (e: any) {
            throw new ClientError(UaSources.certService, UaErrors.errorGetTrust, e.message, e.stack)
        }
    }
}

// async function f() {
//     try {
//         await CertificateService.createCertificate({
//             "outputFile": path.join(FileTransfer.dirname(import.meta.url), '..', '..', '..', 'certificates/PKI/own/certs/client_cert.pem'),
//             "subject": {
//                 "commonName": "UaExpert@WIN-4D29EPFU0V6",
//                 "organization": "uaclient",
//                 "organizationalUnit": "uaclient",
//                 "locality": "mas",
//                 "state": "ah",
//                 "country": "cn",
//                 "domainComponent": "cn"
//             },
//             "applicationUri": "uaclient",
//             "dns": ["WIN-4D29EPFU0V6"],
//             "startDate": new Date(),
//             "validity": 10
//         })
//     } catch (e) {
//         console.log(e)
//     }
// }

// f()
