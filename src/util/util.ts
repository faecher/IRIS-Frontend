/**
 * Allows to unsubscribe from events without the need to store the method reference.
 */
export interface Subscription {
    /**
     * Unsubscribes from the event.
     */
    unsubscribe(): void;
}

export interface Subscriber {
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
}

/**
 * This method is used in order to register an event listener using a lambda function.
 * The return value will allow unsubscribing from the event, without the need to store the method reference.
 * @param target - The target
 * @param message - The message
 * @param listener - The listener
 * @param options - The options
 * @returns a subscription object that can be used to unsubscribe from the event
 */
export function subscribe(target: Subscriber, message: keyof WindowEventMap, listener: (...args: any) => void, options: boolean | AddEventListenerOptions): Subscription {
    target.addEventListener(message, listener, options);
    return {
        unsubscribe: () => {
            target.removeEventListener(message, listener, options);
        }
    };
}