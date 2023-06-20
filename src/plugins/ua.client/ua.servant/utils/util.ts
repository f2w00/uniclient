import {CreateSelfSignCertificateParam1} from 'node-opcua-pki'
import EventEmitter from 'events'
import {StorePrivate} from '../../../../platform/base/store/store'

export module DbUtils {
    /**
     * @description 输出形如yyyy_mm_dd格式的日期字符串
     * @param date
     */
    export function formatDateYMD(date: Date) {
        let monthN = date.getMonth() + 1
        let month = monthN.toString()
        if (monthN < 10) month = '0' + month
        let dayN = date.getDate()
        let day = dayN.toString()
        if (dayN < 10) day = '0' + day
        return `date_${date.getFullYear()}_${month}_${day}`
    }

    export function formatDateYM(date: Date) {
        let monthN = date.getMonth() + 1
        let month = monthN.toString()
        if (monthN < 10) month = '0' + month
        let dayN = date.getDate().valueOf()
        let day = dayN.toString()
        if (dayN < 10) day = '0' + day
        return `month_${date.getFullYear()}_${month}`
    }

    export function formatDateYMW(date: Date) {
        let day = date.getDay()
        let d = date.getDate()
        return `week_${date.getFullYear()}_${date.getMonth() + 1}_${Math.ceil((
                                                                                  d + 6 - day) /
                                                                              7)}`
    }

    export function formatDateY(date: Date) {
        let year = date.getFullYear()
        return `year_${year}`
    }

    export function validateDbName(name: any) {
        if (typeof name === 'string') {
            let reg = new RegExp('^[\u4E00-\u9FA5A-Za-z_]+[\u4E00-\u9FA5a-z0-9_]{2,15}$')
            return reg.test(name)
        } else {
            return false
        }
    }
}

export module CertUtils {
    export function validateCertOptions(param: CreateSelfSignCertificateParam1) {
        if (!(
            typeof param.subject === 'string')) {
            if (param.subject.country) {
                if (param.subject.country.length > 2) {
                    return false
                }
            }
        } else {
            return true
        }
    }
}

export class CommunicateUtil {
    static events: EventEmitter = new EventEmitter()
    static project: string

    constructor() {
        CommunicateUtil.events.on('Workspace.getProjectFileName.return', (project) => {
            CommunicateUtil.project = project
        })
        CommunicateUtil.getProjectInfo()
        CommunicateUtil.addListenerToProcess()
    }

    static getProjectInfo() {
        CommunicateUtil.emitToClient('Workspace.getProjectFileInfo', ['uaclient'])
    }

    static emitToClient(event: string, args?: any[]) {
        process.send
        ? process.send({
                           purpose: 'sendToClient',
                           event: event,
                           args: args,
                       })
        : null
    }

    static addListenerToClient(event: string, handler: (...args: any[]) => void) {
        process.send
        ? process.send({
                           purpose: 'addListenerToClient',
                           event: event,
                           handler: handler,
                       })
        : null
    }

    static addListenerToCommunicate(event: string, handler: (...args: any[]) => void) {
        CommunicateUtil.events.on(event, handler)
    }

    static addListenerToProcess() {
        process.on('message', (message: { event: string; message: any }) => {
            CommunicateUtil.events.emit(message.event, message.message)
        })
    }
}

export class RecordUtil {
    static store: StorePrivate
    static paramsToRecord: Map<string, any>
    static using: string = 'uaRecord:default'
    static recordNames: string[]

    constructor(recordFile?: string) {
        RecordUtil.store = new StorePrivate({
                                                name: 'uaclient',
                                                clearInvalidConfig: false,
                                                fileExtension: 'json'
                                            })
        RecordUtil.restoreRecord(recordFile)
        RecordUtil.recordNames = StorePrivate.get('recordNames')
                                 ? StorePrivate.get('recordNames')
                                 : ['uaRecord:default']
    }

    static recordParams(module: string, param: any) {
        RecordUtil.paramsToRecord.set(module, {...param})
    }

    static getRecords() {
        return RecordUtil.paramsToRecord.keys
    }

    static restoreRecord(recordName?: string) {
        let obj = {}
        if (recordName) {
            obj = StorePrivate.get(recordName)
            RecordUtil.using = recordName
            RecordUtil.recordNames.push(recordName)
        } else {
            let name = StorePrivate.get('usingRecord')
            if (!name) {
                StorePrivate.set('usingRecord', 'uaRecord:default')
            }
            obj = name ? StorePrivate.get(name) : undefined
        }
        RecordUtil.paramsToRecord = new Map<string, any>(obj ? Object.entries(obj) : undefined)
        return obj
    }

    static recordToJson() {
        StorePrivate.set(RecordUtil.using, Object.fromEntries(RecordUtil.paramsToRecord))
        StorePrivate.set('recordNames', RecordUtil.recordNames)
        StorePrivate.set('usingRecord', RecordUtil.using)
    }
}
