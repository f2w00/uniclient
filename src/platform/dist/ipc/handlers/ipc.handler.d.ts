/// <reference types="node" />
import { IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import EventEmitter from 'events';
export declare class ipcClient {
    static localEvents: EventEmitter;
    static clientEvents: EventEmitter;
    static onRender(event: string, eventHandler: (event: IpcMainEvent, ...args: any[]) => void): void;
    static onceRender(event: string, eventHandler: (event: IpcMainEvent, ...args: any[]) => void): void;
    static handleRender(event: string, eventHandler: (event: IpcMainInvokeEvent, ...args: any[]) => void): void;
    static emitToRender(event: string, ...args: any[]): void;
    static emitLocal(event: string, ...args: any[]): void;
    static onLocal(event: string, handler: (...args: any[]) => void): void;
    static onceLocal(event: string, handler: (...args: any[]) => void): void;
    static onClient(event: string, handler: (...args: any[]) => void): void;
    static emitClient(event: string, ...args: any[]): void;
    static emitToChild(event: string, module: string, arg: any): void;
}
