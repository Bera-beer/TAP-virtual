import { setup, fromPromise, assign } from 'xstate';
import { VirtualTapState } from '@/core/domain/tap';
export const VirtualTapEventName = {
    DONE: 'DONE',
    TAG_DETECTED: 'TAG_DETECTED',
    MAINTENANCE_END: 'MAINTENANCE_END',
    MAINTENANCE_START: 'MAINTENANCE_START',
    EXPIRED: 'EXPIRED',
} as const;

export type VirtualTapEventName = typeof VirtualTapEventName[keyof typeof VirtualTapEventName];

export interface VirtualTapUser {
    id: string;
    name: string;
}

export interface VirtualTapContext {
    limitAmountMl: number;
    currentTag?: string;
    user?: VirtualTapUser;
    remainingMs?: number;
    valveOpened: boolean;
}

export type VirtualTapEvent =
    | { type: typeof VirtualTapEventName.DONE }
    | { type: typeof VirtualTapEventName.TAG_DETECTED; tag: string }
    | { type: typeof VirtualTapEventName.MAINTENANCE_END }
    | { type: typeof VirtualTapEventName.MAINTENANCE_START }
    | { type: typeof VirtualTapEventName.EXPIRED };

export const virtualTapMachine = setup({
    types: {
        context: {} as VirtualTapContext,
        events: {} as VirtualTapEvent
    },
    actions: {
        valveOpen: assign({ valveOpened: true }),
        valveClose: assign({ valveOpened: false }),
        wrapUpOperation: () => { },
        assignCredential: assign({
            currentTag: ({ event }) => (event.type === VirtualTapEventName.TAG_DETECTED ? event.tag : undefined)
        })
    },
    actors: {
        validateCredential: fromPromise(async () => {
            // Mock API call delay to see the 'validating' state transition
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                user: {
                    id: 'user-123',
                    name: 'John Doe'
                },
                limitAmountMl: 200
            };
        }),
        resetServerAmount: fromPromise(async () => {
            // Placeholder replaced explicitly at application level
        })
    },
    guards: {
    }
})
    .createMachine({
        context: {
            limitAmountMl: 100,
            valveOpened: false
        },
        id: 'TAP',
        initial: VirtualTapState.IDLE,
        states: {
            [VirtualTapState.IDLE]: {
                description: 'The machine is idle and waiting for user identification.',
                on: {
                    [VirtualTapEventName.TAG_DETECTED]: {
                        target: VirtualTapState.VALIDATING,
                        actions: {
                            type: 'assignCredential'
                        }
                    },
                    [VirtualTapEventName.MAINTENANCE_START]: {
                        target: VirtualTapState.MAINTENANCE
                    }
                }
            },
            [VirtualTapState.VALIDATING]: {
                description: 'The machine is validating the user credits asynchronously.',
                invoke: {
                    id: 'validateCredential',
                    src: 'validateCredential',
                    input: {},
                    onDone: {
                        target: VirtualTapState.OPERATION,
                        actions: assign({
                            user: ({ event }) => event.output.user,
                            limitAmountMl: ({ event }) => event.output.limitAmountMl
                        })
                    },
                    onError: {
                        target: VirtualTapState.INVALID
                    }
                }
            },
            [VirtualTapState.MAINTENANCE]: {
                description: 'Block interaction to maintenance',
                on: {
                    [VirtualTapEventName.MAINTENANCE_END]: {
                        target: VirtualTapState.IDLE
                    }
                }
            },
            [VirtualTapState.OPERATION]: {
                description: 'The machine is in operation, dispensing liquid on pulses.',
                invoke: {
                    src: 'resetServerAmount'
                },
                entry: {
                    type: 'valveOpen'
                },
                exit: {
                    type: 'valveClose'
                },
                on: {
                    [VirtualTapEventName.DONE]: {
                        target: VirtualTapState.FINISHED
                    },
                    [VirtualTapEventName.EXPIRED]: {
                        target: VirtualTapState.FINISHED
                    }
                },
                after: {
                    30000: {
                        target: VirtualTapState.FINISHED
                    }
                }
            },
            [VirtualTapState.FINISHED]: {
                description: 'Sending results and resetting context.',
                entry: {
                    type: 'wrapUpOperation'
                },
                after: {
                    2000: {
                        target: VirtualTapState.IDLE
                    }
                }
            },
            [VirtualTapState.INVALID]: {
                description: 'The validation failed; returning to idle after a delay.',
                after: {
                    2000: {
                        target: VirtualTapState.IDLE
                    }
                }
            }
        }
    });
