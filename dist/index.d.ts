/**
 * A Fiber Wasm instance
 */
declare class Fiber {
    private dbWorker;
    private fiberWorker;
    private inputBuffer;
    private outputBuffer;
    private commandInvokeLock;
    /**
     * Construct a Fiber Wasm  instance.
     * inputBuffer and outputBuffer are buffers used for transporting data between database and fiber wasm. Set them to appropriate sizes.
     * @param inputBufferSize Size of inputBuffer
     * @param outputBufferSize Size of outputBuffer
     */
    constructor(inputBufferSize?: number, outputBufferSize?: number);
    /**
     * Start the Fiber Wasm instance.
     * @param config Config file for fiber
     * @param fiberKeyPair keypair used for fiber
     * @param ckbSecretKey secret key for CKB
     * @param chainSpec Chain spec if chain is neither testnet nor mainnet
     * @param logLevel log level, such as `trace`, `debug`, `info`, `error`
     *
     */
    start(config: string, fiberKeyPair: Uint8Array, ckbSecretKey: Uint8Array, chainSpec?: string, logLevel?: "trace" | "debug" | "info" | "error"): Promise<void>;
    invokeCommand(name: string, args?: any[]): Promise<any>;
    /**
     * Stop the fiber instance.
     */
    stop(): Promise<void>;
}
export { Fiber };
/**
 * Generate a random network secret key.
 * @returns The secret key.
 */
export * from "./types.ts";
//# sourceMappingURL=../src/dist/index.d.ts.map