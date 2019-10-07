export interface IDataResponse {
    /**
     * The content type of the data response.
     */
    contentType: string;
    /**
     * The buffer of data to return.
     */
    data: Buffer;
    /**
     * The filename for an attachment.
     */
    filename?: string;
}
