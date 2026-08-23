declare namespace NodeJS {
  interface ProcessEnv {
    readonly DFX_NETWORK: string;
    readonly MEDVAULT_BACKEND_CANISTER_ID: string;
    readonly INTERNET_IDENTITY_CANISTER_ID: string;
  }
}

declare var process: {
  env: NodeJS.ProcessEnv;
  cwd: () => string;
};

declare const __dirname: string;

declare module 'path' {
  export function resolve(...paths: string[]): string;
}
