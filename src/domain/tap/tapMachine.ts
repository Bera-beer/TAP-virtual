import { setup, assign, fromCallback } from 'xstate';

export interface TapMachineContext {
  remainingMs: number;
}

export type TapMachineEvent = 
  | { type: 'IDENTIFY' }
  | { type: 'TICK'; ms: number };

export const tapMachine = setup({
  types: {
    context: {} as TapMachineContext,
    events: {} as TapMachineEvent,
  },
  actors: {
    tickerLogic: fromCallback(({ sendBack }) => {
      const interval = setInterval(() => {
        sendBack({ type: 'TICK', ms: 50 });
      }, 50);
      return () => clearInterval(interval);
    })
  },
  actions: {
    resetTimer: assign({
      remainingMs: 5000
    }),
    updateTimer: assign({
      remainingMs: ({ context, event }) => {
        if (event.type === 'TICK') {
          return Math.max(0, context.remainingMs - event.ms);
        }
        return context.remainingMs;
      }
    })
  },
  guards: {
    isTimerFinished: ({ context }) => context.remainingMs <= 0
  }
}).createMachine({
  id: 'tapSimulator',
  initial: 'idle',
  context: {
    remainingMs: 0,
  },
  states: {
    idle: {
      on: {
        IDENTIFY: {
          target: 'operation',
        },
      },
    },
    operation: {
      entry: 'resetTimer',
      invoke: {
        id: 'ticker',
        src: 'tickerLogic'
      },
      on: {
        TICK: {
          actions: 'updateTimer'
        }
      },
      always: {
        guard: 'isTimerFinished',
        target: 'idle'
      }
    },
  },
});
