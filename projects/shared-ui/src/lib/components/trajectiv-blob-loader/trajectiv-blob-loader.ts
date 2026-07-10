import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import {
  SnakeDirection,
  TrajectivBlobLoaderCell,
  TrajectivBlobLoaderNode,
  TrajectivBlobLoaderPhase,
} from './trajectiv-blob-loader.model';

let loaderInstanceId = 0;

const GRID_SIZE = 3;

const CELL_SIZE = 64;
const CELL_GAP = 15;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const CELL_RADIUS = 17;

const SNAKE_PATH_STROKE_WIDTH = 10;

/**
 * Le rayon est volontairement proche de la moitié
 * de la cellule afin que les masses fusionnent réellement.
 */
const SNAKE_NODE_RADIUS = 5;

/**
 * Parcours extérieur :
 *
 * 0 → 1 → 2
 * ↑       ↓
 * 3   4   5
 * ↑       ↓
 * 6 ← 7 ← 8
 */
const SNAKE_PATH: readonly number[] = [8, 5, 2, 1, 0, 3, 6, 7];

/**
 * Départ :
 *
 * . . X
 * . . X
 * . . X
 */
const INITIAL_SNAKE: readonly number[] = [2, 5, 8];

/**
 * Les deux orientations possibles du logo final.
 *
 * La tête entre par l’extrémité la plus proche,
 * traverse le centre, puis termine à l’autre extrémité.
 */
const FINAL_DIAGONAL_FROM_TOP_RIGHT: readonly number[] = [2, 4, 6];
const FINAL_DIAGONAL_FROM_BOTTOM_LEFT: readonly number[] = [6, 4, 2];

/**
 * Déplacements autorisés pour la tête.
 *
 * Les diagonales sont autorisées : cela permet notamment
 * de parcourir 2 → 4 → 6 tout en maintenant l’effet gooey.
 */
const GRID_NEIGHBOUR_OFFSETS: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

@Component({
  selector: 'lib-trajectiv-blob-loader',
  imports: [],
  templateUrl: './trajectiv-blob-loader.html',
  styleUrl: './trajectiv-blob-loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--tr-loader-size]': 'size()',
    '[style.--tr-loader-step-duration]': 'stepDurationCss()',
    '[attr.aria-label]': 'label()',
    '[attr.aria-busy]': 'phase() !== "completed"',
    role: 'status',
  },
})
export class TrajectivBlobLoader {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly instanceId = ++loaderInstanceId;

  readonly completed = input(false);
  readonly size = input('9rem');
  readonly label = input('Chargement');
  readonly stepDuration = input(520);

  readonly settled = output<void>();

  readonly phase = signal<TrajectivBlobLoaderPhase>('loading');

  readonly snakeCells = signal<readonly number[]>(INITIAL_SNAKE);

  readonly entryDirection = signal<SnakeDirection>('up');

  protected readonly snakePathStrokeWidth = SNAKE_PATH_STROKE_WIDTH;

  /**
   * Utilisé pour recréer le cercle d’injection
   * et rejouer son animation CSS.
   */
  readonly animationRevision = signal(0);

  readonly cells: readonly TrajectivBlobLoaderCell[] = Array.from(
    {
      length: GRID_SIZE * GRID_SIZE,
    },
    (_, index) => {
      const row = Math.floor(index / GRID_SIZE);
      const column = index % GRID_SIZE;

      return {
        index,
        row,
        column,
        x: column * CELL_STEP,
        y: row * CELL_STEP,
      };
    },
  );

  readonly snakePathFrom = signal(this.createSnakePathD(INITIAL_SNAKE));

  readonly snakePathTo = signal(this.createSnakePathD(INITIAL_SNAKE));

  readonly viewBoxSize = CELL_SIZE * GRID_SIZE + CELL_GAP * (GRID_SIZE - 1);

  readonly gooFilterId = `tr-loader-goo-${this.instanceId}`;

  readonly glowFilterId = `tr-loader-glow-${this.instanceId}`;

  readonly stepDurationCss = computed(() => {
    return `${this.stepDuration()}ms`;
  });

  readonly activeCellSet = computed(() => {
    return new Set(this.snakeCells());
  });

  /**
   * La tête utilise l’injection animée.
   * Les deux cellules suivantes sont déjà remplies.
   */
  readonly bodyCellSet = computed(() => {
    return new Set(this.snakeCells().slice(1));
  });

  readonly snakeNodes = computed<readonly TrajectivBlobLoaderNode[]>(() => {
    return this.snakeCells().map((cellIndex, nodeIndex) => {
      const cell = this.cells[cellIndex];

      const x = cell.x + CELL_SIZE / 2;
      const y = cell.y + CELL_SIZE / 2;

      return {
        id: nodeIndex,
        cellIndex,
        x,
        y,
        transform: `translate(${x}px, ${y}px)`,
      };
    });
  });

  readonly headNode = computed(() => {
    return this.snakeNodes()[0];
  });

  readonly headCellIndex = computed(() => {
    return this.snakeCells()[0];
  });

  readonly headCell = computed(() => {
    return this.cells[this.headCellIndex()];
  });

  readonly headCellClipUrl = computed(() => {
    return `url(#tr-loader-cell-clip-` + `${this.instanceId}-` + `${this.headCellIndex()})`;
  });

  /**
   * Point de départ du remplissage radial.
   * Il est placé sur le bord par lequel arrive le snake.
   */
  readonly injectionPoint = computed(() => {
    const cell = this.headCell();

    const centerX = cell.x + CELL_SIZE / 2;
    const centerY = cell.y + CELL_SIZE / 2;

    const edgeOffset = CELL_SIZE * 0.47;

    switch (this.entryDirection()) {
      case 'left':
        return {
          x: centerX + edgeOffset,
          y: centerY,
        };

      case 'right':
        return {
          x: centerX - edgeOffset,
          y: centerY,
        };

      case 'up':
        return {
          x: centerX,
          y: centerY + edgeOffset,
        };

      case 'down':
        return {
          x: centerX,
          y: centerY - edgeOffset,
        };
    }
  });

  private pathCursor = 2;

  private intervalId: ReturnType<typeof setInterval> | null = null;

  private settleTimeoutIds: ReturnType<typeof setTimeout>[] = [];

  constructor() {
    this.startLoadingAnimation();

    effect(() => {
      const completed = this.completed();

      if (!completed) {
        return;
      }

      untracked(() => {
        this.startSettlingAnimation();
      });
    });

    this.destroyRef.onDestroy(() => {
      this.stopLoadingAnimation();
      this.clearSettleTimeouts();
    });
  }

  protected isBodyCell(index: number): boolean {
    return this.bodyCellSet().has(index);
  }

  protected isSnakeCell(index: number): boolean {
    return this.activeCellSet().has(index);
  }

  private createSnakePathD(snakeCells: readonly number[]): string {
    const points = snakeCells.map((cellIndex) => {
      const cell = this.cells[cellIndex];

      return {
        x: cell.x + CELL_SIZE / 2,
        y: cell.y + CELL_SIZE / 2,
      };
    });

    const [head, middle, tail] = points;

    if (!head || !middle || !tail) {
      return '';
    }

    return [`M ${head.x} ${head.y}`, `L ${middle.x} ${middle.y}`, `L ${tail.x} ${tail.y}`].join(
      ' ',
    );
  }

  private updateSnakeCells(nextSnakeCells: readonly number[]): void {
    const currentSnakeCells = this.snakeCells();

    this.snakePathFrom.set(this.createSnakePathD(currentSnakeCells));

    this.snakePathTo.set(this.createSnakePathD(nextSnakeCells));

    this.snakeCells.set(nextSnakeCells);

    this.animationRevision.update((revision) => revision + 1);
  }

  private startLoadingAnimation(): void {
    this.stopLoadingAnimation();
    this.clearSettleTimeouts();

    this.pathCursor = 2;

    this.phase.set('loading');
    this.entryDirection.set('up');

    this.snakeCells.set(INITIAL_SNAKE);

    const initialPath = this.createSnakePathD(INITIAL_SNAKE);

    this.snakePathFrom.set(initialPath);
    this.snakePathTo.set(initialPath);

    this.animationRevision.set(0);

    this.intervalId = setInterval(() => {
      this.moveSnake();
    }, this.stepDuration());
  }

  private moveSnake(): void {
    if (this.phase() !== 'loading') {
      return;
    }

    const currentSnake = this.snakeCells();
    const previousHeadIndex = currentSnake[0];

    this.pathCursor = (this.pathCursor + 1) % SNAKE_PATH.length;

    const nextHeadIndex = SNAKE_PATH[this.pathCursor];

    this.entryDirection.set(this.resolveDirection(previousHeadIndex, nextHeadIndex));

    this.updateSnakeCells([nextHeadIndex, currentSnake[0], currentSnake[1]]);
  }

  private startSettlingAnimation(): void {
    if (this.phase() !== 'loading') {
      return;
    }

    this.stopLoadingAnimation();
    this.clearSettleTimeouts();

    this.phase.set('settling');

    const headPath = this.createFinalHeadPath();

    if (headPath.length === 0) {
      this.finishSettling();
      return;
    }

    headPath.forEach((nextHeadIndex, index) => {
      const timeoutId = setTimeout(
        () => {
          this.advanceSnakeTo(nextHeadIndex);

          if (index === headPath.length - 1) {
            this.finishSettling();
          }
        },
        (index + 1) * this.stepDuration(),
      );

      this.settleTimeoutIds.push(timeoutId);
    });
  }

  private advanceSnakeTo(nextHeadIndex: number): void {
    const currentSnake = this.snakeCells();
    const previousHeadIndex = currentSnake[0];

    if (nextHeadIndex === previousHeadIndex) {
      return;
    }

    this.entryDirection.set(this.resolveDirection(previousHeadIndex, nextHeadIndex));

    this.updateSnakeCells([nextHeadIndex, previousHeadIndex, currentSnake[1]]);
  }

  private createFinalHeadPath(): readonly number[] {
    const currentHeadIndex = this.snakeCells()[0];

    const topRightDistance = this.getGridDistance(currentHeadIndex, 2);

    const bottomLeftDistance = this.getGridDistance(currentHeadIndex, 6);

    const finalDiagonalPath =
      topRightDistance <= bottomLeftDistance
        ? FINAL_DIAGONAL_FROM_TOP_RIGHT
        : FINAL_DIAGONAL_FROM_BOTTOM_LEFT;

    const entryCellIndex = finalDiagonalPath[0];

    const pathToEntry = this.findShortestHeadPath(currentHeadIndex, entryCellIndex);

    return [...pathToEntry, ...finalDiagonalPath.slice(1)];
  }

  private getGridDistance(fromIndex: number, toIndex: number): number {
    const from = this.cells[fromIndex];
    const to = this.cells[toIndex];

    return Math.max(Math.abs(to.row - from.row), Math.abs(to.column - from.column));
  }

  private findShortestHeadPath(startIndex: number, targetIndex: number): readonly number[] {
    if (startIndex === targetIndex) {
      return [];
    }

    const queue: number[] = [startIndex];

    const visited = new Set<number>([startIndex]);

    const previousByCell = new Map<number, number>();

    while (queue.length > 0) {
      const currentIndex = queue.shift();

      if (currentIndex === undefined) {
        break;
      }

      for (const neighbourIndex of this.getGridNeighbours(currentIndex)) {
        if (visited.has(neighbourIndex)) {
          continue;
        }

        visited.add(neighbourIndex);

        previousByCell.set(neighbourIndex, currentIndex);

        if (neighbourIndex === targetIndex) {
          return this.reconstructPath(startIndex, targetIndex, previousByCell);
        }

        queue.push(neighbourIndex);
      }
    }

    return [targetIndex];
  }

  private getGridNeighbours(cellIndex: number): readonly number[] {
    const cell = this.cells[cellIndex];

    return GRID_NEIGHBOUR_OFFSETS.map(([rowOffset, columnOffset]) => {
      const row = cell.row + rowOffset;
      const column = cell.column + columnOffset;

      if (row < 0 || row >= GRID_SIZE || column < 0 || column >= GRID_SIZE) {
        return null;
      }

      return row * GRID_SIZE + column;
    }).filter((index): index is number => index !== null);
  }

  private reconstructPath(
    startIndex: number,
    targetIndex: number,
    previousByCell: ReadonlyMap<number, number>,
  ): readonly number[] {
    const reversedPath: number[] = [];

    let currentIndex = targetIndex;

    while (currentIndex !== startIndex) {
      reversedPath.push(currentIndex);

      const previousIndex = previousByCell.get(currentIndex);

      if (previousIndex === undefined) {
        return [targetIndex];
      }

      currentIndex = previousIndex;
    }

    return reversedPath.reverse();
  }

  private resolveDirection(previousIndex: number, nextIndex: number): SnakeDirection {
    const previous = this.cells[previousIndex];
    const next = this.cells[nextIndex];

    if (next.column > previous.column) {
      return 'right';
    }

    if (next.column < previous.column) {
      return 'left';
    }

    if (next.row > previous.row) {
      return 'down';
    }

    return 'up';
  }

  private finishSettling(): void {
    this.phase.set('completed');

    const timeoutId = setTimeout(() => {
      this.settled.emit();
    }, 440);

    this.settleTimeoutIds.push(timeoutId);
  }

  private stopLoadingAnimation(): void {
    if (this.intervalId === null) {
      return;
    }

    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  private clearSettleTimeouts(): void {
    for (const timeoutId of this.settleTimeoutIds) {
      clearTimeout(timeoutId);
    }

    this.settleTimeoutIds = [];
  }

  protected readonly cellSize = CELL_SIZE;
  protected readonly cellRadius = CELL_RADIUS;
  protected readonly snakeNodeRadius = SNAKE_NODE_RADIUS;
}
