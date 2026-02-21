export const TapStatus = {
  INITIALIZING: 'initializing',
  READY: 'ready',
  WAITING: 'waiting',
  POURING: 'pouring',
  FINISHED: 'finished'
} as const;

export type TapStatus = typeof TapStatus[keyof typeof TapStatus];

export interface TapData {
  id: string;
  tags: string[];
  status: TapStatus;
}
