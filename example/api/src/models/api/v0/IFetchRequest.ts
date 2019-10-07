export interface IFetchRequest {
    /**
     * What provider are we using to publish.
     */
    provider: string | "mainnet" | "devnet";

    /**
     * The mode for publishing the message.
     */
    mode: "public" | "private" | "restricted";

    /**
     * Key that is required for the data in restricted mode.
     */
    key?: string;

    /**
     * What is the root to read.
     */
    root: string;

    /**
     * What conversion do you want to apply to the return data.
     */
    dataType: "trytes" | "text" | "json";
}
