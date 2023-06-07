import { existsSync, writeFileSync } from 'fs'
import { CreateSelfSignCertificateParam1 } from 'node-opcua-pki'
import EventEmitter from 'events'
import { Config } from '../../config/config.default'

// const Log = require('../../../../platform/base/log/log')

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
        return `week_${date.getFullYear()}_${date.getMonth() + 1}_${Math.ceil((d + 6 - day) / 7)}`
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
        if (!(typeof param.subject === 'string')) {
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

    constructor() {
        CommunicateUtil.addListenerToProcess()
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
    //todo record出错
    static paramsToRecord: Map<string, any>

    constructor(recordFile?: string) {
        let obj = recordFile ? RecordUtil.restoreRecordFromJson(recordFile) : RecordUtil.restoreRecordFromJson()
    }

    static recordParams(module: string, param: any) {
        RecordUtil.paramsToRecord.set(module, { ...param })
    }

    static getRecord() {
        return RecordUtil.paramsToRecord
    }

    static restoreRecordFromJson(fileName?: string) {
        if (fileName) {
            if (!existsSync(fileName)) {
                writeFileSync(fileName, JSON.stringify({}), 'utf-8')
            }
            Config.usualConfig['usingRecord'] = fileName
        } else {
            fileName = (Config.recordJsonFilePath + Config.usualConfig['usingRecord']) as string
        }
        let obj = require(fileName)
        RecordUtil.paramsToRecord = new Map<string, any>(Object.entries(obj))
        return obj
    }

    static recordToJson(fileName: string) {
        writeFileSync(fileName, JSON.stringify(Object.fromEntries(RecordUtil.paramsToRecord)), 'utf-8')
    }
}
