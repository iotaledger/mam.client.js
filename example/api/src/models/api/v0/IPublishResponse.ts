import { IResponse } from "../IResponse";

export interface IPublishResponse extends IResponse {
    /**
     * The root where the message was published.
     */
    publishedRoot?: string;

    /**
     * The next index to publish the next message.
     */
    nextIndex?: number;
}
