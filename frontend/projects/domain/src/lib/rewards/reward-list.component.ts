import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Reward, RewardsService } from 'api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'lib-reward-list',
  templateUrl: './reward-list.component.html',
  styleUrl: './reward-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RewardListComponent implements OnInit {
  private readonly rewardsService = inject(RewardsService);

  readonly rewards = signal<readonly Reward[]>([]);
  readonly status = signal('Ready');

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.status.set('Loading rewards');
    try {
      const rewards = await firstValueFrom(this.rewardsService.getRewards());
      this.rewards.set(rewards);
      this.status.set(`Loaded ${rewards.length} rewards`);
    } catch (error) {
      this.status.set(`Error: ${error instanceof Error ? error.message : 'Unable to load rewards'}`);
    }
  }
}
