import { Channel, ChannelLanguage } from '@zekuru-v2/entities';
import { LinkManager } from './LinkManager';
import { LinkOptions } from './LinkOptions';
import {
  CacheManagerRepository,
  ChannelCacheRepository,
  ChannelInMemoryRepository,
} from '@zekuru-v2/repositories';

function createChannel(id: string, links: string[] = []): Channel {
  const now = new Date();
  const dummyLang: ChannelLanguage = { code: 'en' };
  return new Channel(id, 'guild', links, dummyLang, now, 'user', now, 'user');
}

function createChannelCacheRepo(): ChannelCacheRepository {
  return new ChannelCacheRepository(
    new CacheManagerRepository({}),
    new ChannelInMemoryRepository(),
  );
}

describe('LinkManager', () => {
  test('/link single source:A target:B mode:non-recursive mono:true', async () => {
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const b = createChannel('B');
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mono: true,
      mode: 'non-recursive',
    };

    await manager.link([a, b], options);

    // Expect A -> B but not vice-versa
    expect(a.links).toContain(b._id);
    expect(b.links).not.toContain(a._id);
  });

  test('/link single source:A target:B mode:non-recursive mono:false', async () => {
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const b = createChannel('B');
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mode: 'non-recursive',
    };

    await manager.link([a, b], options);

    // Expect A <-> B
    expect(a.links).toContain(b._id);
    expect(b.links).toContain(a._id);
  });

  test('/link single source:A target:B mode:adjacent mono:true', async () => {
    // Initial setup: A, B -> C -> D
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const d = createChannel('D');
    await repo.set(d._id, d);
    const c = createChannel('C', [d._id]); // C -> D
    await repo.set(c._id, c);
    const b = createChannel('B', [c._id]); // B -> C
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mono: true,
      mode: 'adjacent',
    };

    await manager.link([a, b], options);

    // Expect that A connects to B and C but NOT D and vice-versa
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).not.toContain(d._id);
    expect(d.links).not.toContain(a._id);

    // Expect that B and C are NOT connected to A
    expect(b.links).not.toContain(a._id);
    expect(c.links).not.toContain(a._id);
  });

  test('/link single source:A target:B mode:adjacent mono:false', async () => {
    // Initial setup: A, B -> C -> D
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const d = createChannel('D');
    await repo.set(d._id, d);
    const c = createChannel('C', [d._id]); // C -> D
    await repo.set(c._id, c);
    const b = createChannel('B', [c._id]); // B -> C
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mode: 'adjacent',
    };

    await manager.link([a, b], options);

    // Expect that A connects to B and C but NOT D and vice-versa
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).not.toContain(d._id);
    expect(d.links).not.toContain(a._id);

    // Expect that B and C are connected to A
    expect(b.links).toContain(a._id);
    expect(c.links).toContain(a._id);
  });

  test('/link single source:A target:B mode:recursive mono:true', async () => {
    // Initial setup: A, B -> C -> D
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const d = createChannel('D');
    await repo.set(d._id, d);
    const c = createChannel('C', [d._id]); // C -> D
    await repo.set(c._id, c);
    const b = createChannel('B', [c._id]); // B -> C
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mono: true,
      mode: 'recursive',
    };

    await manager.link([a, b], options);

    // Expect that A connects to B, C, and D
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).toContain(d._id);

    // Expect that B, C, and D are NOT connected to A
    expect(b.links).not.toContain(a._id);
    expect(c.links).not.toContain(a._id);
    expect(d.links).not.toContain(a._id);
  });

  test('/link single source:A target:B mode:recursive mono:false', async () => {
    // Initial setup: A, B -> C -> D
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const d = createChannel('D');
    await repo.set(d._id, d);
    const c = createChannel('C', [d._id]); // C -> D
    await repo.set(c._id, c);
    const b = createChannel('B', [c._id]); // B -> C
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mode: 'recursive',
    };

    await manager.link([a, b], options);

    // Expect that A connects to B, C, and D
    expect(a.links).toContain(b._id);
    expect(a.links).toContain(c._id);
    expect(a.links).toContain(d._id);

    // Expect that B, C, and D are connected to A
    expect(b.links).toContain(a._id);
    expect(c.links).toContain(a._id);
    expect(d.links).toContain(a._id);
  });

  test('/link multiple A B C mode:non-recursive', async () => {
    // Initial setup: A, B, C -> D
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const b = createChannel('B');
    await repo.set(b._id, b);
    const d = createChannel('D');
    await repo.set(d._id, d);
    const c = createChannel('C', [d._id]); // C -> D
    await repo.set(c._id, c);
    const manager = new LinkManager(repo);

    await manager.link([a, b, c], { mode: 'non-recursive' });

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

  test('/link multiple A B C mode:recursive', async () => {
    // Initial setup: A, B, C -> D
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const b = createChannel('B');
    await repo.set(b._id, b);
    const d = createChannel('D');
    await repo.set(d._id, d);
    const c = createChannel('C', [d._id]); // C -> D
    await repo.set(c._id, c);
    const manager = new LinkManager(repo);

    await manager.link([a, b, c], { mode: 'recursive' });

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

  test('that it links but DO NOT save to db', async () => {
    // Since saving is something that should be done in bulk.
    const repo = createChannelCacheRepo();
    const a = createChannel('A');
    await repo.set(a._id, a);
    const b = createChannel('B');
    await repo.set(b._id, b);
    const manager = new LinkManager(repo);
    const options: LinkOptions = {
      single: true,
      mode: 'non-recursive',
    };

    const localA = createChannel('A');
    const localB = createChannel('B');
    await manager.link([localA, localB], options);

    // Expect A <-> B but NOT in db
    expect(localA.links).toContain(b._id);
    expect(localB.links).toContain(a._id);
    const dbA = await repo.get(a._id, true);
    expect(dbA.links).toHaveLength(0);
    const dbB = await repo.get(b._id, true);
    expect(dbB.links).toHaveLength(0);
  });
});
