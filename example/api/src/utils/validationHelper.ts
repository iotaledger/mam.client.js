/**
 * Helper functions for validating input.
 */
export class ValidationHelper {
    /**
     * Does the parameter have some content.
     * @param name The parameter name.
     * @param param The param to validate.
     */
    public static isEmpty(name: string, param: any): void {
        if (param === undefined || param === null) {
            throw new Error(`The parameter '${name}' has an invalid value, it can not be empty.`);
        }
    }

    /**
     * Does the string have some content.
     * @param name The parameter name.
     * @param str The string to validate.
     */
    public static string(name: string, str: string): void {
        if (str === undefined || str === null || str.trim().length === 0) {
            throw new Error(`The parameter '${name}' has an invalid value, it can not be empty.`);
        }
    }

    /**
     * Does the number have a value.
     * @param name The parameter name.
     * @param num The number to validate.
     */
    public static number(name: string, num: number): void {
        if (num === undefined || num === null || typeof num !== "number") {
            throw new Error(`The parameter '${name}' has an invalid value, it should be a number.`);
        }
    }

    /**
     * Is the value of one the specified items.
     * @param name The parameter name.
     * @param val The value to validate.
     * @param options The possible options.
     */
    public static oneOf(name: string, val: any, options: any[]): void {
        if (options.indexOf(val) < 0) {
            throw new Error(
                `The parameter '${name}' has an invalid value, it should be one of [${options.join(", ")}].`);
        }
    }
}
