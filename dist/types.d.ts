interface DbWorkerInitializationOptions {
    inputBuffer: SharedArrayBuffer;
    outputBuffer: SharedArrayBuffer;
    logLevel: string;
}
interface FiberWorkerInitializationOptions {
    inputBuffer: SharedArrayBuffer;
    outputBuffer: SharedArrayBuffer;
    logLevel: string;
    fiberKeyPair: Uint8Array;
    ckbSecretKey: Uint8Array;
    config: string;
    chainSpec?: string;
}
interface FiberInvokeRequest {
    name: string;
    args: any[];
}
type FiberInvokeResponse = {
    ok: true;
    data: any;
} | {
    ok: false;
    error: string;
};
export type { DbWorkerInitializationOptions, FiberWorkerInitializationOptions, FiberInvokeRequest, FiberInvokeResponse };
//# sourceMappingURL=../src/dist/types.d.ts.map