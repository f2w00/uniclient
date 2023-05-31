import {TableCreateModes, UaErrors, UaSources} from '../../common/ua.enums'
import {Config} from '../../config/config.default'
import {CommunicateUtil, DbUtils} from '../utils/util'
import {IDbData, IFieldNames} from '../models/params.model'
import {DataTypes} from 'sequelize'
import {UaMessage} from '../models/message.model'
import {ClientError} from '../middlewares/agent.middleware'
//todo 全面测试数据库模块
export module DbService {
    export let defaultTableName: string = Config.defaultTable
    export let defaultAttributes: any = Config.defaultAttributes

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
                            serverTimestamp: {
                                type: DataTypes.STRING,
                                allowNull: false,
                                field: fields.serverTimestampF,
                            },
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
            //todo 注意这里需要创建一个pipe然后再进行注册
            CommunicateUtil.emitToClient('Broker.create', [{name: Config.defaultPipeName}])
            CommunicateUtil.emitToClient('pipe:' + Config.defaultPipeName + '.registerIpc', [{module: 'uaclient'}])
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
            CommunicateUtil.emitToClient('Persistence.insert', [data])
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
            CommunicateUtil.emitToClient('Persistence.insertMany', dataList)
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
            // await Persistence.configureDb(table, attribute)
            let storage = ''
            //todo 测试storage问题
            CommunicateUtil.emitToClient('Workspace.getProjectFileName', [{module: 'opcua'}])
            CommunicateUtil.addListenerToCommunicate('project:fileName', (fileName: string) => {
                storage = fileName + './database'
            })
            CommunicateUtil.emitToClient('Persistence.initAttributes', [
                {
                    persistId: 'opcua',
                    modelAttributes: attribute,
                    options: {dialect: 'sqlite', storage: storage, logging: false},
                    tableName: tableName,
                },
            ])
        } catch (e: any) {
            throw new ClientError(UaSources.dbService, UaErrors.errorCreatTable, e.message, e.stack)
        }
    }
}