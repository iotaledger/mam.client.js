import { LoadBalancerSettings, Mam as MamLb } from "@iota/client-load-balancer";
import * as Mam from "@iota/mam";
import { isTag, isTrytes, isTrytesOfExactLength } from "@iota/validators";
import { ServiceFactory } from "../../factories/serviceFactory";
import { IPublishRequest } from "../../models/api/v0/IPublishRequest";
import { IPublishResponse } from "../../models/api/v0/IPublishResponse";
import { IConfiguration } from "../../models/configuration/IConfiguration";
import { TrytesHelper } from "../../utils/trytesHelper";
import { ValidationHelper } from "../../utils/validationHelper";

/**
 * Publish a MAM message.
 * @param config The configuration.
 * @param request The request object.
 * @returns The response.
 */
export async function publish(config: IConfiguration, request: IPublishRequest): Promise<IPublishResponse> {
    ValidationHelper.string("provider", request.provider);

    if (request.provider !== "devnet" &&
        request.provider !== "mainnet" &&
        !request.provider.startsWith("http")) {
        throw new Error("The provider must be either mainnet, devnet or the url for a node starting http/https.");
    }

    if (request.provider.startsWith("http")) {
        if (request.depth === undefined || request.depth === null) {
            throw new Error("The depth must be provided if you are using a url for provider.");
        }
        ValidationHelper.number("depth", request.depth);

        if (request.mwm === undefined || request.mwm === null) {
            throw new Error("The mwm must be provided if you are using a url for provider.");
        }
        ValidationHelper.number("mwm", request.mwm);
    }

    ValidationHelper.oneOf("mode", request.mode, ["public", "private", "restricted"]);

    if (request.mode === "restricted") {
        ValidationHelper.string("key", request.key);
    } else {
        if (request.key) {
            throw new Error("The key is only used in restricted mode.");
        }
    }

    ValidationHelper.string("seed", request.seed);
    if (!isTrytesOfExactLength(request.seed, 81)) {
        throw new Error(`The seed field must only contain trytes, and be 81 characters long, its is ${request.seed.length}.`);
    }

    if (request.index !== undefined && request.index !== null) {
        ValidationHelper.number("index", request.index);
    }

    ValidationHelper.oneOf("dataType", request.dataType, ["trytes", "text", "json"]);
    ValidationHelper.isEmpty("data", request.data);

    if (request.dataType === "trytes" && !isTrytes(request.data)) {
        throw new Error("The data field must only contain trytes.");
    }

    if (request.tag && !isTag(request.tag)) {
        throw new Error("The tag field must only contain trytes.");
    }

    let mamInstance;
    let mamState;
    let mwm = 0;
    let depth = 0;

    if (request.provider.startsWith("http")) {
        mamInstance = Mam;
        mamState = Mam.init(request.provider, request.seed);
        mwm = request.mwm;
        depth = request.depth;
    } else {
        const loadBalancerSettings = ServiceFactory.get<LoadBalancerSettings>(
            `${request.provider}-load-balancer-settings`
        );
        mamInstance = MamLb;
        mamState = MamLb.init(loadBalancerSettings, request.seed);
    }

    mamInstance.changeMode(mamState, request.mode, request.key);

    if (request.index !== undefined && request.index !== null) {
        mamState.channel.start = request.index;
    }

    let data = request.data;
    if (request.dataType === "json") {
        data = TrytesHelper.objectToTrytes(request.data);
    } else if (request.dataType === "text") {
        data = TrytesHelper.stringToTrytes(request.data);
    }

    const message = mamInstance.create(mamState, data);
    await mamInstance.attach(message.payload, message.address, depth, mwm, request.tag);

    return {
        success: true,
        message: "OK",
        nextIndex: mamState.channel.start,
        publishedRoot: message.root
    };
}
