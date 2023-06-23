import { FindOptions, ModelAttributes, Options, WhereOptions } from 'sequelize';
export declare class Persistence {
    private sequelize;
    private currentModel;
    constructor(attributes: ModelAttributes, options: Options, tableName?: string);
    insert(record: any): Promise<void>;
    insertMany(records: any[]): Promise<void>;
    read(options: FindOptions): Promise<any[]>;
    update(values: Object, where: WhereOptions): Promise<void>;
    configureDb(options: {
        tableName?: string;
        attributes?: ModelAttributes;
        conf?: Options;
    }): Promise<void>;
    initDataModel(attributes: ModelAttributes, tableName?: string): Promise<void>;
}
