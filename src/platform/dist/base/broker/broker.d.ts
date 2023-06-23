type pipeId = string;
export declare class MessagePipe {
    content: Map<string, any[]>;
    maxLength: number;
    pipeId: pipeId;
    ipcToNotice?: string;
    constructor(pipeId: pipeId, maxLength?: number);
    changeMaxLength(length: number): boolean;
    inPipe(id: string, message: any): Promise<void>;
    terminate(): Map<string, any[]>;
}
export declare class Broker {
    static pipes: Map<pipeId, MessagePipe>;
    constructor();
    static receive(pipeId: pipeId, messageId: string, message: any): Promise<boolean>;
    static hasPipe(pipeId: string): boolean;
    static getPipe(pipeId: string): MessagePipe;
    static createPipe(pipeId: string): MessagePipe;
    static changePipeLength(pipeId: pipeId, length: number): void;
    beforeClose(): Promise<void>;
}
export {};
