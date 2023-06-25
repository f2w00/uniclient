import Store from 'electron-store';
export type storeOptions = {
    name: string;
    fileExtension: string;
    clearInvalidConfig: boolean;
};
export declare class ClientStore {
    static stores: Map<string, Store>;
    static cwd: string;
    static renderStore: Store;
    constructor(options?: {
        client?: boolean;
        cwd?: string;
    });
    static set(storeName: string, key: string, content: any): boolean;
    static get(storeName: string, key: string): any;
    static del(storeName: string, key: string): boolean;
    static has(storeName: string, key: string): boolean;
    static create(options: storeOptions): Store<Record<string, unknown>>;
    private initBind;
}
export declare class StorePrivate {
    static store: Store;
    constructor(options: storeOptions);
    static set(key: string, content: any): boolean;
    static get(key: string): any;
    static del(key: string): boolean;
    static has(key: string): boolean;
}
export declare class RunningRecord {
    static moduleNum: number;
    static startedServices: Map<string, string>;
    static completeLoading(module: string): void;
    static completeClose(module: string): void;
}
export declare const sharedData: Store<Record<string, unknown>>;
