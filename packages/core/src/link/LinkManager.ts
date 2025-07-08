/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Channel } from '@zekuru-v2/entities';
import { LinkMode, LinkOptions } from './LinkOptions';
import { ChannelCacheRepository } from '@zekuru-v2/repositories';

export class LinkManager {
  private linkedSet = new Set<Channel>();

  constructor(private channelRepo: ChannelCacheRepository) {}

  async link(channels: Channel[], options: LinkOptions): Promise<void> {
    this.linkedSet = new Set<Channel>();

    const sourceSet = options.single ? [channels[0]] : channels;
    const targetSet = await this._buildTargets(channels, options);

    const promises: ReturnType<typeof this._link>[] = [];
    for (const src of sourceSet) {
      for (const tgt of targetSet) {
        if (src !== tgt) promises.push(this._link(src, tgt, options.mono));
      }
    }
    await Promise.all(promises);
  }

  getLinkedChannels(): Channel[] {
    return Array.from(this.linkedSet);
  }

  private async _buildTargets(
    channels: Channel[],
    options: LinkOptions,
  ): Promise<Set<Channel>> {
    let targetSet: Set<Channel>;

    if (options.single) {
      targetSet = await this._traverse(channels[1], options.mode);
    } else {
      if (options.mode === 'recursive') {
        targetSet = new Set();
        for (const ch of channels) {
          for (const r of await this._traverse(ch, 'recursive'))
            targetSet.add(r);
        }
      } else {
        targetSet = new Set(channels);
      }
    }

    return targetSet;
  }

  private async _traverse(
    root: Channel,
    mode: LinkMode,
  ): Promise<Set<Channel>> {
    const visited = new Set<Channel>();
    const stack = [root];

    while (stack.length) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;

      visited.add(current);

      const channel = await this.channelRepo.get(current._id, true);
      const neighbors = await Promise.all(
        channel.links.map((link) => this.channelRepo.get(link, true)),
      );

      if (mode === 'recursive') {
        for (const n of neighbors) if (!visited.has(n)) stack.push(n);
      } else if (mode === 'adjacent') {
        for (const n of neighbors) visited.add(n);
      }
    }

    return visited;
  }

  private async _link(
    source: Channel,
    target: Channel,
    mono = false,
  ): Promise<void> {
    if (source._id === target._id) return; // Ignore same channel link

    const sourceSet = new Set(source.links);
    sourceSet.add(target._id);
    this.linkedSet.add(target);
    source.links = Array.from(sourceSet);

    if (!mono) {
      // Link bidirectionally
      const targetSet = new Set(target.links);
      targetSet.add(source._id);
      this.linkedSet.add(source);
      target.links = Array.from(targetSet);
    }
  }
}
