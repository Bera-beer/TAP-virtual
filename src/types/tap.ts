export const VirtualTapState = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  MAINTENANCE: 'maintenance',
  OPERATION: 'operation',
  FINISHED: 'finished',
  INVALID: 'invalid',
} as const;

export type VirtualTapState = typeof VirtualTapState[keyof typeof VirtualTapState];

export const VirtualTapStateLiteralMap: Record<VirtualTapState, string> = {
  [VirtualTapState.IDLE]: 'Start operation!',
  [VirtualTapState.VALIDATING]: 'Validating...',
  [VirtualTapState.MAINTENANCE]: 'Maintenance',
  [VirtualTapState.OPERATION]: 'Pouring...',
  [VirtualTapState.FINISHED]: 'Finished',
  [VirtualTapState.INVALID]: 'Ops! Invalid :(',
};
