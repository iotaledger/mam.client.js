import { asciiToTrytes, trytesToAscii } from "@iota/converter";
import { TextHelper } from "./textHelper";

/**
 * Helper functions for use with trytes.
 */
export class TrytesHelper {
    /**
     * Convert an object to Trytes.
     * @param obj The obj to encode.
     * @returns The encoded trytes value.
     */
    public static objectToTrytes(obj: any): string {
        const json = JSON.stringify(obj);
        return TrytesHelper.stringToTrytes(json);
    }

    /**
     * Convert an object from Trytes.
     * @param trytes The trytes to decode.
     * @returns The decoded object.
     */
    public static objectFromTrytes<T>(trytes: string): T {
        const ascii = TrytesHelper.stringFromTrytes(trytes);
        const json = TextHelper.decodeNonASCII(ascii);

        return json ? JSON.parse(json) : undefined;
    }

    /**
     * Convert a string to Trytes.
     * @param str The string to encode.
     * @returns The encoded trytes value.
     */
    public static stringToTrytes(str: string): string {
        const encoded = TextHelper.encodeNonASCII(str);
        return encoded ? asciiToTrytes(encoded) : "";
    }

    /**
     * Convert a string from Trytes.
     * @param trytes The trytes to decode.
     * @returns The decoded string.
     */
    public static stringFromTrytes(trytes: string): string {
        // Trim trailing 9s
        let trimmed = trytes.replace(/\9+$/, "");

        // And make sure it is even length (2 trytes per ascii char)
        if (trimmed.length % 2 === 1) {
            trimmed += "9";
        }

        const ascii = trytesToAscii(trimmed);

        return TextHelper.decodeNonASCII(ascii);
    }
}
