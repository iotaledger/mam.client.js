export interface IPublishRequest {
    /**
     * What provider are we using to publish.
     */
    provider: string | "mainnet" | "devnet";

    /**
     * What depth are we using for attaching.
     */
    depth?: number;

    /**
     * What mwm are we using for attaching.
     */
    mwm?: number;

    /**
     * The mode for publishing the message.
     */
    mode: "public" | "private" | "restricted";

    /**
     * Key that is required for the data in restricted mode.
     */
    key?: string;

    /**
     * What is the seed we are using to publish the mam channel.
     */
    seed: string;

    /**
     * What is the index we are publishing at.
     */
    index?: number;

    /**
     * What is the data type.
     */
    dataType: "trytes" | "text" | "json";

    /**
     * What is the data to publish in the channel.
     */
    data: any;

    /**
     * An optional tag to include with the transaction.
     */
    tag?: string;
}
