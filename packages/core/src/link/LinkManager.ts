/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Channel } from '@zekuru-v2/entities';
import { Snowflake } from '@zekuru-v2/types';
import { LinkMode, LinkOptions } from './LinkOptions';

export class LinkManager {
  private map = new Map<Channel, Set<Channel>>();

  constructor(channels: Channel[]) {
    const idToChannel = new Map<Snowflake, Channel>();

    // Build lookup map
    for (const ch of channels) {
      idToChannel.set(ch._id, ch);
    }

    // Resolve links
    for (const ch of channels) {
      const linked = new Set<Channel>();

      for (const id of ch.links) {
        // TODO: What to do if channel is undefined?
        const channel = idToChannel.get(id);
        if (channel) linked.add(channel);
      }

      this.map.set(ch, linked);
    }
  }

  link(channels: Channel[], options: LinkOptions): void {
    const sourceSet = options.single ? [channels[0]] : channels;
    const targetSet = this._buildTargets(channels, options);

    for (const src of sourceSet) {
      for (const tgt of targetSet) {
        if (src !== tgt) this._link(src, tgt, options.mono);
      }
    }
  }

  _buildTargets(channels: Channel[], options: LinkOptions): Set<Channel> {
    let targetSet: Set<Channel>;

    if (options.single) {
      targetSet = this._traverse(channels[1], options.mode);
    } else {
      if (options.mode === 'recursive') {
        targetSet = new Set();
        for (const ch of channels) {
          for (const r of this._traverse(ch, 'recursive')) targetSet.add(r);
        }
      } else {
        targetSet = new Set(channels);
      }
    }

    return targetSet;
  }

  _traverse(root: Channel, mode: LinkMode): Set<Channel> {
    const visited = new Set<Channel>();
    const stack = [root];

    while (stack.length) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;

      visited.add(current);

      const neighbors = this.map.get(current) ?? new Set();

      if (mode === 'recursive') {
        for (const n of neighbors) if (!visited.has(n)) stack.push(n);
      } else if (mode === 'adjacent') {
        for (const n of neighbors) visited.add(n);
      }
    }

    return visited;
  }

  _link(source: Channel, target: Channel, mono = false): void {
    if (source._id === target._id) return; // Ignore same channel link

    if (!this.map.has(source)) this.map.set(source, new Set());
    this.map.get(source)!.add(target);

    if (!mono) {
      if (!this.map.has(target)) this.map.set(target, new Set());
      this.map.get(target)!.add(source);
    }
  }
}
