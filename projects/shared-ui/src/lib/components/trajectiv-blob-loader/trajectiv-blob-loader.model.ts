export type TrajectivBlobLoaderPhase = 'loading' | 'settling' | 'completed';

export type SnakeDirection = 'up' | 'right' | 'down' | 'left';

export type TrajectivBlobLoaderCell = {
  readonly index: number;
  readonly row: number;
  readonly column: number;
  readonly x: number;
  readonly y: number;
};

export type TrajectivBlobLoaderNode = {
  readonly id: number;
  readonly cellIndex: number;
  readonly x: number;
  readonly y: number;
  readonly transform: string;
};
