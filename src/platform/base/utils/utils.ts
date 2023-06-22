import {readdirSync, statSync, watch} from 'fs'

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
