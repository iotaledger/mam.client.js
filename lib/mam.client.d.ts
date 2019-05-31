/**
 * @iota/mam definition file.
 */
declare module "@iota/mam" {
    import { Transaction, AttachToTangle } from "@iota/core";

    /**
     * The mode for the mam channel.
     */
    export type MamMode = "public" | "private" | "restricted";

    /**
     * A mam channel.
     */
    export interface MamChannel {
        side_key: string;
        mode: MamMode;
        next_root: string;
        security: number;
        start: number;
        count: number;
        next_count: number;
        index: number;
    }

    /**
     * A mam subscribed channel.
     */
    export interface MamSubscribedChannel {
        mode: string;
        channelKey: string;
        timeout: number;
        root: string;
        next_root: string;
        active: boolean;
    }

    /**
     * The mam state.
     */
    export interface MamState {
        subscribed: MamSubscribedChannel[];
        channel: MamChannel;
        seed: string;
    }

    /**
     * The mam settings.
     */
    export interface MamSettings {
        /**
         * The IRI Node provider string.
         */
        provider: string;
        /**
         * Override the attach to tangle method.
         */
        attachToTangle?: AttachToTangle
    }

    /**
     * A mam message
     */
    export interface MamMessage {
        /**
         * The update mam state.
         */
        state: MamState;
        /**
         * The payload to attach.
         */
        payload: string;
        /**
         * The root for the message.
         */
        root: string;
        /**
         * The address for the message.
         */
        address: string;
    }

    /**
     * Initialisation function which returns a state object
     * @param settings Either a provider string or an object with provider string and attachToTangle method.
     * @param seed The seed to initialise with.
     * @param security The security level, defaults to 2.
     * @returns State object to be used with future actions.
     */
    function init(settings: string | MamSettings,
        seed?: string, security?: number): MamState;

    /**
     * Add a subscription to your state object
     * @param state The mam state.
     * @param channelRoot The channel root.
     * @param channelMode The channel mode, defaults to public.
     * @param channelKey The optional channel key.
     * @returns Updated state object to be used with future actions.
     */
    function subscribe(state: MamState, channelRoot: string, channelMode?: MamMode, channelKey?: string): MamState;

    /**
     * Change the mode of the channel.
     * @param state The mam state.
     * @param mode The new mode.
     * @param sidekey The sideKey required for restricted.
     * @returns Updated state object to be used with future actions.
     */
    function changeMode(state: MamState, mode: MamMode, sidekey?: string): MamState;

    /**
     * Create a message to use on the mam channel.
     * @param state The mam state.
     * @param message The Tryte encoded message.
     * @returns An object containing the payload and updated state.
     */
    function create(state: MamState, message: string): MamMessage;

    /**
     * Decode a message.
     * @param payload The payload of the message.
     * @param sideKey The sideKey used in the message.
     * @param root The root used for the message.
     * @returns The decoded payload.
     */
    function decode(payload: string, sideKey: string, root: string): string;

    /**
     * Fetch the messages asynchronously.
     * @param root The root key to use.
     * @param mode The mode of the channel.
     * @param sideKey The sideKey used in the messages, only required for restricted.
     * @param callback Optional callback to receive each payload.
     * @param limit Limit the number of messages that are fetched.
     * @returns The nextRoot and the messages if no callback was supplied, or an Error.
     */
    function fetch(root: string, mode: MamMode, sideKey?: string, callback?: (payload: string) => void, limit?: number): Promise<{
        /**
         * The root for the next message.
         */
        nextRoot: string;
        /**
         * All the message payloads.
         */
        messages?: string[];
    } | Error>;

    /**
     * Fetch a single message asynchronously.
     * @param root The root key to use.
     * @param mode The mode of the channel.
     * @param sideKey The sideKey used in the messages.
     * @returns The nextRoot and the payload, or an Error.
     */
    function fetchSingle(root: string, mode: MamMode, sideKey?: string): Promise<{
        /**
         * The root for the next message.
         */
        nextRoot: string;
        /**
         * The payload for the message.
         */
        payload?: string;
    } | Error>;

    /**
     * Attach the mam trytes to the tangle.
     * @param trytes The trytes to attach.
     * @param root The root to attach them to.
     * @param depth The depth to attach them with, defaults to 3.
     * @param mwm The minimum weight magnitude to attach with, defaults to 9 for devnet, 14 required for mainnet.
     * @param tag Trytes to tag the message with.
     * @returns The transaction objects.
     */
    function attach(trytes: string, root: string, depth?: number, mwm?: number, tag?: string): Promise<ReadonlyArray<Transaction>>;

    /**
     * Listen for new message on the channel.
     * @param channel The channel to listen on.
     * @param callback The callback to receive any messages,
     */
    function listen(channel: MamSubscribedChannel, callback: (messages: string[]) => void): void;

    /**
     * Get the root from the mam state.
     * @param state The mam state.
     * @returns The root.
     */
    function getRoot(state: MamState): string;

    /**
     * Set the provider.
     * @param provider The IOTA provider to use.
     */
    function setIOTA(provider?: string): void;

    /**
     * Set the attachToTangle.
     * @param attachToTangle The attach to tangle method to use.
     */
    function setAttachToTangle(attachToTangle?: AttachToTangle): void;

    export {
        init,
        subscribe,
        changeMode,
        create,
        decode,
        fetch,
        fetchSingle,
        attach,
        listen,
        getRoot,
        setIOTA,
        setAttachToTangle
    };
}
