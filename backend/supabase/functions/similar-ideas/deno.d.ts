
declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined
  }
}