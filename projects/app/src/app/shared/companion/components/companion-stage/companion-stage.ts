import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import {
  CompanionAnimationCommand,
  CompanionAnimationConfig,
  CompanionLightingPreset,
} from '../../models/companion-animation.model';
import { CompanionRendererService } from './companion-renderer.service';

@Component({
  selector: 'app-companion-stage',
  imports: [],
  providers: [CompanionRendererService],
  templateUrl: './companion-stage.html',
  styleUrl: './companion-stage.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanionStageComponent implements AfterViewInit {
  readonly lightingPreset = input<CompanionLightingPreset>('day');
  readonly config = input.required<CompanionAnimationConfig>();
  readonly command = input<CompanionAnimationCommand | null>(null);

  private readonly renderer = inject(CompanionRendererService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  private resizeObserver: ResizeObserver | null = null;
  private lastPlayedCommandId: number | null = null;

  readonly isReady = signal(false);
  readonly hasError = signal(false);

  readonly loadingProgress = signal(0);
  readonly isIntroVisible = signal(true);

  readonly loadingRatio = computed(() => {
    return this.loadingProgress() / 100;
  });

  readonly isLoadingVisible = computed(() => {
    return !this.hasError() && (!this.isReady() || this.isIntroVisible());
  });

  constructor() {
    effect(() => {
      const config = this.config();

      if (!this.isReady()) {
        return;
      }

      this.renderer.applyConfig(config);
    });
    effect(() => {
      const command = this.command();

      if (!this.isReady() || !command) {
        return;
      }

      if (command.id === this.lastPlayedCommandId) {
        return;
      }

      this.lastPlayedCommandId = command.id;

      if (command.mode === 'loop') {
        this.renderer.playLoop(command.name);
        return;
      }

      this.renderer.playOnce(command.name, command.fallback ?? 'idle');
    });

    effect(() => {
      const preset = this.lightingPreset();

      if (!this.isReady()) {
        return;
      }

      this.renderer.setLightingPreset(preset);
    });
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      const host = this.host().nativeElement;

      await this.renderer.init(host, this.config(), (progress) => {
        this.loadingProgress.set(progress);
      });

      this.resizeObserver = new ResizeObserver(() => {
        this.renderer.resize(host);
      });

      this.resizeObserver.observe(host);

      this.destroyRef.onDestroy(() => {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.renderer.dispose();
      });

      this.loadingProgress.set(100);
      this.isReady.set(true);

      window.setTimeout(() => {
        this.isIntroVisible.set(false);
      }, 520);
    } catch (error) {
      console.error('[CompanionStage] init failed', error);
      this.hasError.set(true);
    }
  }
}
