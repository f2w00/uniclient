import { OPCUACertificateManager } from 'node-opcua'
import { CreateSelfSignCertificateParam1 } from 'node-opcua-pki'
import { Certificate } from 'node-opcua-crypto'
import { UaErrors, UaSources } from '../../common/ua.enums'
import { Config } from '../../config/config.default'
import { ClientError } from '../../../../platform/base/log/log'

// const cry = require("node-opcua-pki")

export module CertificateService {
    export let certificate = new OPCUACertificateManager({
        rootFolder: Config.certRoot,
        name: 'pki',
        automaticallyAcceptUnknownCertificate: false,
    })

    //todo node-opcua-pki命令测试
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
            await certificate.createSelfSignedCertificate({ ...params })
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
