import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, MessageCircle, Copy, Check, Trash2, RefreshCw } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { TelegramService, TelegramLink, TelegramLinkCode } from '../../services/telegram.service';

@Component({
  selector: 'app-telegram-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TranslocoModule],
  templateUrl: './telegram-settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelegramSettings {
  private readonly telegramService = inject(TelegramService);

  protected readonly MessageCircleIcon = MessageCircle;
  protected readonly CopyIcon = Copy;
  protected readonly CheckIcon = Check;
  protected readonly TrashIcon = Trash2;
  protected readonly RefreshIcon = RefreshCw;

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly linkCode = signal<TelegramLinkCode | null>(null);
  protected readonly links = signal<TelegramLink[]>([]);
  protected readonly copied = signal(false);
  protected readonly countdown = signal(0);

  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.loadLinks();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  protected loadLinks(): void {
    this.telegramService.getMyLinks().subscribe({
      next: (links) => this.links.set(links),
      error: () => {}, // Silently fail, links are optional
    });
  }

  protected generateCode(): void {
    this.loading.set(true);
    this.error.set(null);
    this.copied.set(false);

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.telegramService.generateCode().subscribe({
      next: (code) => {
        this.linkCode.set(code);
        this.loading.set(false);
        this.startCountdown(code.expiresInSeconds);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al generar código');
        this.loading.set(false);
      },
    });
  }

  protected copyCode(): void {
    const code = this.linkCode()?.code;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      });
    }
  }

  protected unlink(linkId: string): void {
    if (!confirm('¿Desvincular esta cuenta de Telegram?')) {
      return;
    }

    this.telegramService.unlink(linkId).subscribe({
      next: () => {
        this.links.update((links) => links.filter((l) => l.id !== linkId));
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al desvincular');
      },
    });
  }

  private startCountdown(seconds: number): void {
    this.countdown.set(seconds);

    this.countdownInterval = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        this.countdown.set(0);
        this.linkCode.set(null);
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      } else {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }

  protected formatCountdown(): string {
    const seconds = this.countdown();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
