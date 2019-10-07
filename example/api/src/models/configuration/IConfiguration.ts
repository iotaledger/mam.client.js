import { INodeConfiguration } from "./INodeConfiguration";

/**
 * Definition of configuration file.
 */
export interface IConfiguration {
    /**
     * The providers to use for IOTA communication on mainnet.
     */
    mainNetNodes: INodeConfiguration[];

    /**
     * The providers to use for IOTA communication on devnet.
     */
    devNetNodes: INodeConfiguration[];

    /**
     * A list of domains allowed to access the api.
     */
    allowedDomains: string[];
}
