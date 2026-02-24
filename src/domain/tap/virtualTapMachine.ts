import { setup, fromPromise, assign } from 'xstate';
export const VirtualTapEventName = {
  DONE: 'DONE',
  TAG_DETECTED: 'TAG_DETECTED',
  MAINTENANCE_END: 'MAINTENANCE_END',
  MAINTENANCE_START: 'MAINTENANCE_START',
} as const;

export type VirtualTapEventName = typeof VirtualTapEventName[keyof typeof VirtualTapEventName];

export interface VirtualTapUser {
  id: string;
  name: string;
}

export interface VirtualTapContext {
  limitAmountMl: number;
  servedAmountMl: number;
  currentTag?: string;
  user?: VirtualTapUser;
  remainingMs?: number;
}

export type VirtualTapEvent =
  | { type: typeof VirtualTapEventName.DONE }
  | { type: typeof VirtualTapEventName.TAG_DETECTED; tag: string }
  | { type: typeof VirtualTapEventName.MAINTENANCE_END }
  | { type: typeof VirtualTapEventName.MAINTENANCE_START };

export const virtualTapMachine = setup({
    types: {
        context: {} as VirtualTapContext,
        events: {} as VirtualTapEvent
    },
    actions: {
        valveOpen: () => { },
        valveClose: () => { },
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
        })
    },
    guards: {
        amountLimitReached: ({ context }) => context.servedAmountMl >= context.limitAmountMl
    }
}).createMachine({
    context: {
        limitAmountMl: 100,
        servedAmountMl: 0
    },
    id: 'TAP',
    initial: 'idle',
    states: {
        idle: {
            description: 'The machine is idle and waiting for user identification.',
            on: {
                [VirtualTapEventName.TAG_DETECTED]: {
                    target: 'validating',
                    actions: {
                        type: 'assignCredential'
                    }
                },
                [VirtualTapEventName.MAINTENANCE_START]: {
                    target: 'maintenance'
                }
            }
        },
        validating: {
            description: 'The machine is validating the user credits asynchronously.',
            invoke: {
                id: 'validateCredential',
                src: 'validateCredential',
                input: {},
                onDone: {
                    target: 'operation',
                    actions: assign({
                        user: ({ event }) => event.output.user,
                        limitAmountMl: ({ event }) => event.output.limitAmountMl
                    })
                },
                onError: {
                    target: 'invalid'
                }
            }
        },
        maintenance: {
            description: 'Block interaction to maintenance',
            on: {
                [VirtualTapEventName.MAINTENANCE_END]: {
                    target: 'idle'
                }
            }
        },
        operation: {
            description: 'The machine is in operation, dispensing liquid on pulses.',
            initial: 'pouring',
            states: {
                pouring: {
                    entry: {
                        type: 'valveOpen'
                    },
                    exit: {
                        type: 'valveClose'
                    },
                    on: {
                        [VirtualTapEventName.DONE]: {
                            target: 'finished'
                        }
                    },
                    after: {
                        30000: {
                            target: 'finished'
                        }
                    }
                },
                finished: {
                    description: 'Sending results and resetting context.',
                    entry: {
                        type: 'wrapUpOperation'
                    },
                    after: {
                        2000: {
                            target: '#TAP.idle'
                        }
                    }
                }
            }
        },
        invalid: {
            description: 'The validation failed; returning to idle after a delay.',
            after: {
                2000: {
                    target: 'idle'
                }
            }
        }
    }
});
