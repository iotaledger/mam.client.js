import { IResponse } from "../IResponse";

export interface IFetchResponse extends IResponse {
    /**
     * The data found during the fetch.
     */
    data?: any;

    /**
     * The root where the next message is available.
     */
    nextRoot?: string;
}
