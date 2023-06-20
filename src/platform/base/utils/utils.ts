import {readdirSync, statSync, watch} from 'fs'

export class Utils {
    /**
     * @description 输出形如yyyy_mm_dd格式的日期字符串
     * @param date
     */
    static formatDateYMD(date: Date) {
        let monthN = date.getMonth() + 1
        let month = monthN.toString()
        if (monthN < 10) month = '0' + month
        let dayN = date.getDate()
        let day = dayN.toString()
        if (dayN < 10) day = '0' + day
        return `date_${date.getFullYear()}_${month}_${day}`
    }

    static formatDateYM(date: Date) {
        let monthN = date.getMonth() + 1
        let month = monthN.toString()
        if (monthN < 10) month = '0' + month
        let dayN = date.getDate().valueOf()
        let day = dayN.toString()
        if (dayN < 10) day = '0' + day
        return `month_${date.getFullYear()}_${month}`
    }

    static formatDateYMW(date: Date) {
        let day = date.getDay()
        let d = date.getDate()
        return `week_${date.getFullYear()}_${date.getMonth() + 1}_${Math.ceil((d + 6 - day) / 7)}`
    }

    static formatDateY(date: Date) {
        let year = date.getFullYear()
        return `year_${year}`
    }

    static validateDbName(name: any) {
        if (typeof name === 'string') {
            let reg = new RegExp('^[\u4E00-\u9FA5A-Za-z_]+[\u4E00-\u9FA5a-z0-9_]{2,15}$')
            return reg.test(name)
        } else {
            return false
        }
    }
}

type file = {
    name: string
    isDir: boolean
    child: Object[] | null | undefined
}

export class FileUtils {
    constructor() {}

    static makeDir() {
        // mkdir(this.file.storagePath + `\\${projectName}` + `\\.${projectType}`, () => {
        //     mkdir(this.file.storagePath + `\\${projectName}` + '\\.client', () => {})
        // })
    }

    static openFolder(fileName: string) {
        return readdirSync(fileName)
    }

    static deleteFile(files: string[], fileName: string) {
        let result: file[] = []
        files.forEach((value) => {
            let isDir = statSync(fileName + '/' + value).isDirectory()
            result.push({
                name: value,
                isDir: isDir,
                child: null,
            })
        })
        return result
    }

    static getSubfolders(fileName: string) {
        let files = readdirSync(fileName)
        let results: string[] = []
        files.forEach((file) => {
            if (statSync(fileName + '/' + file).isDirectory()) {
                results.push(file)
            }
        })
        return results
    }

    static openFolderWithChild(fileName: string): file[] {
        let files = readdirSync(fileName)
        let results: file[] = []
        files.forEach((file) => {
            if (statSync(fileName + '/' + file).isDirectory()) {
                results.push({ name: file, isDir: true, child: readdirSync(fileName + '/' + file) })
            } else {
                results.push({ name: file, isDir: false, child: null })
            }
        })
        return results
    }

    static watchFolder(path: string) {
        watch(
            path,
            {
                persistent: true,
            },
            (event, filename) => {}
        )
    }
}
