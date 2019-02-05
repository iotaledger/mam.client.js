import 'fast-text-encoding';
import { NativeContext } from './bindings';

enum TritEncoding {
    BYTE = 1,
    TRIT,
    TRYTE,
}

export function assertHash(s: string) {
    if(s.length != 81) {
        throw "Input is not of length 81";
    }

    if(!(/^[A-Z9]{81}$/.test(s))) {
        throw "Input is not validt TryteString";
    }
}

function asciiFromMemory(ctx: NativeContext, start: number, length: number): string {
    let str = "";
    let buf = new Uint8Array(ctx.fns().memory.buffer, start, length);

    for (let i = 0; i < buf.length; i++) {
        str += String.fromCharCode(buf[i]);
    }

    return str;
}

function asciiToMemory(ctx: NativeContext, what: string): number {
    // This is ~probably~ definitely dangerous.
    let buf = new Uint8Array(ctx.fns().memory.buffer);
    let enc = new TextEncoder().encode(what);
    buf.set(enc);
    return 0;
}

export function stringToCTrits(ctx: NativeContext, str: string): any {
    let strin = ctx.fns().iota_ctrits_ctrits_from_trytes(asciiToMemory(ctx, str), str.length);
    let out = ctx.fns().iota_ctrits_convert(strin, TritEncoding.TRIT);
    ctx.fns().iota_ctrits_drop(strin);
    return out;
}

export function ctritsToString(ctx: NativeContext, ct: any): string {
    let trytes = ctx.fns().iota_ctrits_convert(ct, TritEncoding.TRYTE);
    let ptr = ctx.fns().iota_ctrits_ctrits_data(trytes);
    let len = ctx.fns().iota_ctrits_ctrits_length(trytes);

    let out = asciiFromMemory(ctx, ptr, len);
    ctx.fns().iota_ctrits_drop(trytes);

    return out;
}
