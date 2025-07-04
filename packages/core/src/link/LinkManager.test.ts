/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Channel, ChannelLanguage } from '@zekuru-v2/entities';
import { LinkManager } from './LinkManager';
import { LinkOptions } from './LinkOptions';

function createChannel(id: string, links: string[] = []): Channel {
  const now = new Date();
  const dummyLang: ChannelLanguage = { code: 'en' };
  return new Channel(id, 'guild', links, dummyLang, now, 'user', now, 'user');
}

describe('LinkManager', () => {
  test('/link single source:A target:B mode:non-recursive mono:true', () => {
    const a = createChannel('A');
    const b = createChannel('B');
    const manager = new LinkManager([a, b]);
    const options: LinkOptions = {
      single: true,
      mono: true,
      mode: 'non-recursive',
    };

    manager.link([a, b], options);

    // Expect A -> B but not vice-versa
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(false);
  });

  test('/link single source:A target:B mode:non-recursive mono:false', () => {
    const a = createChannel('A');
    const b = createChannel('B');
    const manager = new LinkManager([a, b]);
    const options: LinkOptions = {
      single: true,
      mode: 'non-recursive',
    };

    manager.link([a, b], options);

    // Expect A <-> B
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(true);
  });

  test('/link single source:A target:B mode:adjacent mono:true', () => {
    // Initial setup: A, B -> C -> D
    const a = createChannel('A');
    const d = createChannel('D');
    const c = createChannel('C', [d._id]); // C -> D
    const b = createChannel('B', [c._id]); // B -> C
    const manager = new LinkManager([a, b, c, d]);
    const options: LinkOptions = {
      single: true,
      mono: true,
      mode: 'adjacent',
    };

    manager.link([a, b], options);

    // Expect that A connects to B and C but NOT D and vice-versa
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    expect(linkedFromA.has(c)).toBe(true);
    expect(linkedFromA.has(d)).toBe(false);
    const linkedFromD = manager['map'].get(d)!;
    expect(linkedFromD.has(a)).toBe(false);

    // Expect that B and C are NOT connected to A
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(false);
    const linkedFromC = manager['map'].get(c)!;
    expect(linkedFromC.has(a)).toBe(false);
  });

  test('/link single source:A target:B mode:adjacent mono:false', () => {
    // Initial setup: A, B -> C -> D
    const a = createChannel('A');
    const d = createChannel('D');
    const c = createChannel('C', [d._id]); // C -> D
    const b = createChannel('B', [c._id]); // B -> C
    const manager = new LinkManager([a, b, c, d]);
    const options: LinkOptions = {
      single: true,
      mode: 'adjacent',
    };

    manager.link([a, b], options);

    // Expect that A connects to B and C but NOT D and vice-versa
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    expect(linkedFromA.has(c)).toBe(true);
    expect(linkedFromA.has(d)).toBe(false);
    const linkedFromD = manager['map'].get(d)!;
    expect(linkedFromD.has(a)).toBe(false);

    // Expect that B and C are connected to A
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(true);
    const linkedFromC = manager['map'].get(c)!;
    expect(linkedFromC.has(a)).toBe(true);
  });

  test('/link single source:A target:B mode:recursive mono:true', () => {
    // Initial setup: A, B -> C -> D
    const a = createChannel('A');
    const d = createChannel('D');
    const c = createChannel('C', [d._id]); // C -> D
    const b = createChannel('B', [c._id]); // B -> C
    const manager = new LinkManager([a, b, c, d]);
    const options: LinkOptions = {
      single: true,
      mono: true,
      mode: 'recursive',
    };

    manager.link([a, b], options);

    // Expect that A connects to B, C, and D
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    expect(linkedFromA.has(c)).toBe(true);
    expect(linkedFromA.has(d)).toBe(true);

    // Expect that B, C, and D are NOT connected to A
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(false);
    const linkedFromC = manager['map'].get(c)!;
    expect(linkedFromC.has(a)).toBe(false);
    const linkedFromD = manager['map'].get(d)!;
    expect(linkedFromD.has(a)).toBe(false);
  });

  test('/link single source:A target:B mode:recursive mono:false', () => {
    // Initial setup: A, B -> C -> D
    const a = createChannel('A');
    const d = createChannel('D');
    const c = createChannel('C', [d._id]); // C -> D
    const b = createChannel('B', [c._id]); // B -> C
    const manager = new LinkManager([a, b, c, d]);
    const options: LinkOptions = {
      single: true,
      mode: 'recursive',
    };

    manager.link([a, b], options);

    // Expect that A connects to B, C, and D
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    expect(linkedFromA.has(c)).toBe(true);
    expect(linkedFromA.has(d)).toBe(true);

    // Expect that B, C, and D are connected to A
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(true);
    const linkedFromC = manager['map'].get(c)!;
    expect(linkedFromC.has(a)).toBe(true);
    const linkedFromD = manager['map'].get(d)!;
    expect(linkedFromD.has(a)).toBe(true);
  });

  test('/link multiple A B C mode:non-recursive', () => {
    // Initial setup: A, B, C -> D
    const a = createChannel('A');
    const b = createChannel('B');
    const d = createChannel('D');
    const c = createChannel('C', [d._id]); // C -> D
    const manager = new LinkManager([a, b, c, d]);

    manager.link([a, b, c], { mode: 'non-recursive' });

    // Expect that A connects to B and C but NOT D
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    expect(linkedFromA.has(c)).toBe(true);
    expect(linkedFromA.has(d)).toBe(false);

    // Expect that B connects to A and C but NOT D
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(true);
    expect(linkedFromB.has(c)).toBe(true);
    expect(linkedFromB.has(d)).toBe(false);

    // Expect that C connects to A and B, and remains connected with D
    const linkedFromC = manager['map'].get(c)!;
    expect(linkedFromC.has(a)).toBe(true);
    expect(linkedFromC.has(b)).toBe(true);
    expect(linkedFromC.has(d)).toBe(true);

    // Expect that D is NOT connected to A, B, and C (since it's only C -> D, not vice-versa)
    const linkedFromD = manager['map'].get(d)!;
    expect(linkedFromD.has(a)).toBe(false);
    expect(linkedFromD.has(b)).toBe(false);
    expect(linkedFromD.has(c)).toBe(false);
  });

  test('/link multiple A B C mode:recursive', () => {
    // Initial setup: A, B, C -> D
    const a = createChannel('A');
    const b = createChannel('B');
    const d = createChannel('D');
    const c = createChannel('C', [d._id]); // C -> D
    const manager = new LinkManager([a, b, c, d]);

    manager.link([a, b, c], { mode: 'recursive' });

    // Expect that A connects to B, C, and D
    const linkedFromA = manager['map'].get(a)!;
    expect(linkedFromA.has(b)).toBe(true);
    expect(linkedFromA.has(c)).toBe(true);
    expect(linkedFromA.has(d)).toBe(true);

    // Expect that B connects to A, C, and D
    const linkedFromB = manager['map'].get(b)!;
    expect(linkedFromB.has(a)).toBe(true);
    expect(linkedFromB.has(c)).toBe(true);
    expect(linkedFromB.has(d)).toBe(true);

    // Expect that C connects to A, B, and remains connected with D
    const linkedFromC = manager['map'].get(c)!;
    expect(linkedFromC.has(a)).toBe(true);
    expect(linkedFromC.has(b)).toBe(true);
    expect(linkedFromC.has(d)).toBe(true);

    // Expect that D connects to A, B, and C
    const linkedFromD = manager['map'].get(d)!;
    expect(linkedFromD.has(a)).toBe(true);
    expect(linkedFromD.has(b)).toBe(true);
    expect(linkedFromD.has(c)).toBe(true);
  });
});
