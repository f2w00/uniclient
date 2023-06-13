import { Persistence } from './../../../../platform/base/persist/persistence'
import { TableCreateModes, UaErrors, UaSources } from '../../common/ua.enums'
import { Config } from '../../config/config.default'
import { CommunicateUtil, DbUtils } from '../utils/util'
import { IDbData, IFieldNames } from '../models/params.model'
import { DataTypes } from 'sequelize'
import { UaMessage } from '../models/message.model'
import { ClientError } from '../middlewares/agent.middleware'
export module DbService {
    export let defaultTableName: string = Config.defaultTable
    export let defaultAttributes: any = Config.defaultAttributes
    export let persist!: Persistence

    /**
     * @description 用于初始化database,如果表名不存在则创建一个新表
     * @param createMode
     * @param tableName
     * @param fields
     */
    export async function init(createMode: TableCreateModes, tableName?: string, fields?: IFieldNames) {
        try {
            switch (createMode) {
                case TableCreateModes.default:
                case TableCreateModes.createPerWeek: {
                    defaultTableName = DbUtils.formatDateYMW(new Date())
                    break
                }
                case TableCreateModes.createPerDay: {
                    defaultTableName = DbUtils.formatDateYMD(new Date())
                    break
                }
                case TableCreateModes.createPerMonth: {
                    defaultTableName = DbUtils.formatDateYM(new Date())
                    break
                }
                case TableCreateModes.createPerYear: {
                    defaultTableName = DbUtils.formatDateY(new Date())
                    break
                }
                case TableCreateModes.customTableName:
                case TableCreateModes.customField:
                case TableCreateModes.customBoth: {
                    if (tableName) defaultTableName = tableName
                    if (fields) {
                        defaultAttributes = {
                            server: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.serverF,
                            },
                            nodeId: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.nodeIdF,
                            },
                            displayName: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.displayNameF,
                            },
                            value: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.valueF,
                            },
                            dataType: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.dataTypeF,
                            },
                            sourceTimestamp: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.sourceTimestampF,
                            },
                            // serverTimestamp: {
                            //     type: DataTypes.STRING,
                            //     allowNull: false,
                            //     field: fields.serverTimestampF,
                            // },
                            statusCode: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.statusCodeF,
                            },
                        }
                    }
                    break
                }
                default:
                    throw new ClientError(UaSources.dbService, UaErrors.errorTableMode)
            }
            await DbService.createTable()
            // 注意这里需要创建一个pipe然后再进行注册
            CommunicateUtil.emitToClient('Broker.create', [{ name: Config.defaultPipeName }])
            CommunicateUtil.emitToClient('pipe:' + Config.defaultPipeName + '.registerIpc', [{ module: 'uaclient' }])
            CommunicateUtil.events.on('pipe:' + Config.defaultPipeName + '.full', (data: UaMessage[]) => {
                DbService.insertMany(data)
            })
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreateClient, e.message, e.stack)
        }
    }

    /**
     * @description 传入参数来插入数据,可以指定表名和字段名称
     * @param data
     */
    export async function insert(data: IDbData) {
        try {
            persist.insert(data)
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorInsert, e.message, e.stack)
        }
    }

    /**
     * @description 连续写入多条数据
     * @param dataList
     */
    export async function insertMany(dataList: IDbData[]) {
        try {
            persist.insertMany(dataList)
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorInsert, e.message, e.stack)
        }
    }

    /**
     * @description 用于创建一个表,可以定制表名和字段名,输入即可,但注意sqlite3表命名规范
     * @param tableName
     * @param attributes
     */
    export async function createTable(tableName?: string, attributes?: any) {
        try {
            let table = tableName ? tableName : defaultTableName
            let attribute = attributes ? attributes : defaultAttributes
            CommunicateUtil.emitToClient('Workspace.getProjectFileName', ['uaclient'])
            CommunicateUtil.events.on('Workspace.getProjectFileName', (project) => {
                persist = new Persistence(
                    attribute,
                    { dialect: 'sqlite', storage: project + '/database/data.db', logging: false },
                    table
                )
            })
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreatTable, e.message, e.stack)
        }
    }
}
