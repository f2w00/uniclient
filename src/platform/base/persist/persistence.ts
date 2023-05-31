import {ipcClient} from './../../ipc/handlers/ipc.handler'
import {Utils} from './../utils/utils.js'
import {FindOptions, ModelAttributes, ModelCtor, Options, Sequelize} from 'sequelize'
import {ClientStore, ConfigNames} from '../../../client/store/store.js'

export class PersistenceManager {
    static persisters: Map<string, Persistence>

    constructor() {
        PersistenceManager.persisters = new Map<string, Persistence>()
        ipcClient.onClient('Persistence.insertMany', (persistId: string, records: any[]) => {
            PersistenceManager.insertMany(persistId, records)
        })
        ipcClient.onClient(
            'Persistence.initAttributes',
            (persistId: string, modelAttributes: ModelAttributes, options: Options, tableName?: string) => {
                PersistenceManager.initAttributes(persistId, modelAttributes, options, tableName)
            }
        )
    }

    static initAttributes(persistId: string, modelAttributes: ModelAttributes, options: Options, tableName?: string) {
        let persist = new Persistence(modelAttributes, options, tableName)
        PersistenceManager.persisters.set(persistId, persist)
    }

    static async insert(persistId: string, record: any) {
        let persist = PersistenceManager.persisters.get(persistId)
        if (persist) {
            persist.insert(record)
            return true
        } else {
            return false
        }
    }

    static async insertMany(persistId: string, records: any[]) {
        let persist = PersistenceManager.persisters.get(persistId)
        if (persist) {
            persist.insertMany(records)
            return true
        } else {
            return false
        }
    }

    static async read(persistId: string, options: FindOptions) {
        let persist = PersistenceManager.persisters.get(persistId)
        if (persist) {
            return persist.read(options)
        } else {
            return false
        }
    }
}

/**
 * @description 用来完成基础数据库的增删改查的功能,当初始化的时候必须指定modelAttributes即数据库模型数据,
 * 当不指定options时,那么默认以sqlite初始化
 */
export class Persistence {
    private sequelize!: Sequelize
    private currentModel!: ModelCtor<any>

    constructor(attributes: ModelAttributes, options: Options, tableName?: string) {
        try {
            this.sequelize = new Sequelize(options)
            this.initDataModel(attributes, tableName)
            // } else {
            //     if (storage) {
            //         this.sequelize = new Sequelize({
            //             dialect: 'sqlite',
            //             storage: storage,
            //             logging: false,
            //         })
            //     }
            // }
        } catch (e: any) {
            throw e
        }
    }

    async insert(record: any) {
        try {
            await this.currentModel.create({...record})
        } catch (e: any) {
            throw e
        }
    }

    async insertMany(records: any[]) {
        try {
            await this.currentModel.bulkCreate(records)
        } catch (e: any) {
            throw e
        }
    }

    async read(options: FindOptions) {
        return this.currentModel.findAll(options)
    }

    // async update() {
    //     this.currentModel.update()
    // }

    async configureDb(tableName?: string, attributes?: ModelAttributes, conf?: Options) {
        try {
            if (conf) {
                this.sequelize = new Sequelize(conf)
                ClientStore.set('config', ConfigNames.persistence, conf)
            }
            if (tableName && attributes) {
                this.initDataModel(attributes, tableName)
            }
        } catch (e: any) {
            throw e
        }
    }

    async initDataModel(attributes: ModelAttributes, tableName?: string) {
        try {
            tableName = tableName ? tableName : Utils.formatDateYMW(new Date())
            await this.sequelize.authenticate()
            this.currentModel = await this.sequelize.define(tableName, attributes, {timestamps: false})
            await this.currentModel.sync()
        } catch (e: any) {
            throw e
        }
    }

    //todo crud,备份/配置
}
