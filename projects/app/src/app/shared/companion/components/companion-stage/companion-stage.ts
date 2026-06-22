import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
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
})
export class CompanionStageComponent implements AfterViewInit {
  readonly lightingPreset = input<CompanionLightingPreset>('day');
  private readonly renderer = inject(CompanionRendererService);
  private readonly destroyRef = inject(DestroyRef);

  readonly config = input.required<CompanionAnimationConfig>();
  readonly command = input<CompanionAnimationCommand | null>(null);

  private resizeObserver: ResizeObserver | null = null;

  readonly isReady = signal(false);
  readonly hasError = signal(false);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  private lastPlayedCommandId: number | null = null;

  constructor() {
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

      await this.renderer.init(host, this.config());

      this.resizeObserver = new ResizeObserver(() => {
        this.renderer.resize(host);
      });

      this.resizeObserver.observe(host);

      this.destroyRef.onDestroy(() => {
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
        this.renderer.dispose();
      });

      this.isReady.set(true);
    } catch {
      this.hasError.set(true);
    }
  }
}
