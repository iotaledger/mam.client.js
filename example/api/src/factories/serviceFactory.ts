/**
 * Factory for creating services.
 */
export class ServiceFactory {
    /**
     * Store the service callbacks.
     */
    private static readonly _services: { [name: string]: () => any } = {};
    /**
     * Store the created instances.
     */
    private static readonly _instances: { [name: string]: any } = {};

    /**
     * Register a new service.
     * @param name The name of the service.
     * @param instanceCallback The callback to create an instance.
     */
    public static register(name: string, instanceCallback: () => any): void {
        this._services[name] = instanceCallback;
        if (this._instances[name]) {
            delete this._instances[name];
        }
    }

    /**
     * Unregister a service.
     * @param name The name of the service to unregister.
     */
    public static unregister(name: string): void {
        delete this._services[name];
        if (this._instances[name]) {
            delete this._instances[name];
        }
    }

    /**
     * Get a service instance.
     * @param name The name of the service to get.
     * @returns An instance of the service.
     */
    public static get<T>(name: string): T {
        if (!this._instances[name] && this._services[name]) {
            this._instances[name] = this._services[name]();
        }
        return this._instances[name];
    }
}
