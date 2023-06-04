import { FindOptions, ModelAttributes, ModelCtor, Options, Sequelize, WhereOptions } from 'sequelize'

/**
 * @description 用来完成基础数据库的增删改查的功能,当初始化的时候必须指定modelAttributes即数据库模型数据,
 * 当不指定options时,那么默认以sqlite初始化
 */
export class Persistence {
    private sequelize: Sequelize
    private currentModel!: ModelCtor<any>

    constructor(attributes: ModelAttributes, options: Options, tableName?: string) {
        try {
            this.sequelize = new Sequelize(options)
            this.initDataModel(attributes, tableName)
        } catch (e: any) {
            throw e
        }
    }

    /**
     *
     * @param record
     * @example
     *
     */
    async insert(record: any) {
        try {
            await this.currentModel.create({ ...record })
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
        return await this.currentModel.findAll(options)
    }

    async update(values: Object, where: WhereOptions) {
        try {
            await this.currentModel.update(values, {
                where: where,
            })
        } catch (e: any) {
            throw e
        }
    }

    /**
     *
     * @param options 选择参数
     * - `tableName?: string`
     * - `attributes?: ModelAttributes`
     * - `conf?: Options`
     */
    async configureDb(options: { tableName?: string; attributes?: ModelAttributes; conf?: Options }) {
        try {
            if (options.conf) {
                this.sequelize = new Sequelize(options.conf)
            }
            if (options.tableName && options.attributes) {
                this.initDataModel(options.attributes, options.tableName)
            }
        } catch (e: any) {
            throw e
        }
    }

    async initDataModel(attributes: ModelAttributes, tableName?: string) {
        try {
            tableName = tableName ? tableName : 'uniclient'
            await this.sequelize.authenticate()
            this.currentModel = await this.sequelize.define(tableName, attributes, { timestamps: false })
            await this.currentModel.sync()
        } catch (e: any) {
            throw e
        }
    }
}
