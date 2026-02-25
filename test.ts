import { virtualTapMachine } from './src/core/domain/virtualTapMachine';
import { useMachine } from '@xstate/vue';
import { fromPromise } from 'xstate';
import { ref } from 'vue';

const servedAmountMl = ref(0);
const { snapshot, send, actorRef } = useMachine(virtualTapMachine.provide({
    actors: {
        resetServerAmount: fromPromise(async () => {
            servedAmountMl.value = 0;
        })
    }
}));
