/**
 * Class to handle http errors.
 */
export class HttpError extends Error {
    /**
     * The HTTP code to return.
     */
    public httpCode: number;

    /**
     * Create a new instance of HttpError.
     * @param message The message for the error.
     * @param httpCode The http status code.
     */
    constructor(message: string, httpCode: number) {
        super(message);
        this.httpCode = httpCode;
    }
}
