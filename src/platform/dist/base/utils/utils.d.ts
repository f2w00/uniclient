type file = {
    name: string;
    isDir: boolean;
    child: Object[] | null | undefined;
};
export declare class FileUtils {
    constructor();
    static makeDir(): void;
    static openFolder(fileName: string): string[];
    static deleteFile(files: string[], fileName: string): file[];
    static getSubfolders(fileName: string): string[];
    static openFolderWithChild(fileName: string): file[];
    static watchFolder(path: string): void;
}
export {};
