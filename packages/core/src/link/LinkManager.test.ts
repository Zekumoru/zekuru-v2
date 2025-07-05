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
    expect(a.links).toContain(b._id);
    expect(b.links).not.toContain(a._id);
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
    expect(a.links).toContain(b._id);
    expect(b.links).toContain(a._id);
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
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).not.toContain(d._id);
    expect(d.links).not.toContain(a._id);

    // Expect that B and C are NOT connected to A
    expect(b.links).not.toContain(a._id);
    expect(c.links).not.toContain(a._id);
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
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).not.toContain(d._id);
    expect(d.links).not.toContain(a._id);

    // Expect that B and C are connected to A
    expect(b.links).toContain(a._id);
    expect(c.links).toContain(a._id);
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
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).toContain(d._id);

    // Expect that B, C, and D are NOT connected to A
    expect(b.links).not.toContain(a._id);
    expect(c.links).not.toContain(a._id);
    expect(d.links).not.toContain(a._id);
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
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).toContain(d._id);

    // Expect that B, C, and D are connected to A
    expect(b.links).toContain(a._id);
    expect(c.links).toContain(a._id);
    expect(d.links).toContain(a._id);
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
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).not.toContain(d._id);

    // Expect that B connects to A and C but NOT D
    expect(b.links).toContain(a._id);
    expect(b.links).toContain(c._id);
    expect(b.links).not.toContain(d._id);

    // Expect that C connects to A and B, and remains connected with D
    expect(c.links).toContain(a._id);
    expect(c.links).toContain(b._id);
    expect(c.links).toContain(d._id);

    // Expect that D is NOT connected to A, B, and C (since it's only C -> D, not vice-versa)
    expect(d.links).not.toContain(a._id);
    expect(d.links).not.toContain(b._id);
    expect(d.links).not.toContain(c._id);
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
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).toContain(d._id);

    // Expect that B connects to A, C, and D
    expect(b.links).toContain(a._id);
    expect(b.links).toContain(c._id);
    expect(b.links).toContain(d._id);

    // Expect that C connects to A, B, and remains connected with D
    expect(c.links).toContain(a._id);
    expect(c.links).toContain(b._id);
    expect(c.links).toContain(d._id);

    // Expect that D connects to A, B, and C
    expect(d.links).toContain(a._id);
    expect(d.links).toContain(b._id);
    expect(d.links).toContain(c._id);
  });
});
