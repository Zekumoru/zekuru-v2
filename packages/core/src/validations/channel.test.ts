/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Discord from 'discord.js';
import * as ZK from '@zekuru-v2/entities';
import { runValidators } from './validators';
import {
  ChannelValidatorContext,
  isLinkLimitReachedValidator,
  isTextChannelValidator,
  isTranslateChannelValidator,
} from './channel';
import {
  CacheManagerRepository,
  ChannelCacheRepository,
  ChannelInMemoryRepository,
} from '@zekuru-v2/repositories';

describe('ChannelValidator', () => {
  it('should pass all validations', async () => {
    const id = '123';
    const discordChannel = {
      id,
      type: Discord.ChannelType.GuildText,
    } as Discord.Channel;
    const cacheRepo = new ChannelCacheRepository(
      new CacheManagerRepository({}),
      new ChannelInMemoryRepository(),
    );
    const trChannel: ZK.Channel = { _id: id, links: [] } as any;
    await cacheRepo.set(id, trChannel);
    const ctx: ChannelValidatorContext = { cacheRepo };

    const results = runValidators(discordChannel, ctx, [
      isTextChannelValidator,
      isTranslateChannelValidator,
      isLinkLimitReachedValidator,
    ]);

    expect(results).resolves.toHaveLength(0);
  });

  it('should fail validation if not a text channel', async () => {
    const discordChannel = {
      id: '123',
      type: Discord.ChannelType.GuildCategory,
    } as Discord.Channel;
    const cacheRepo = new ChannelCacheRepository(
      new CacheManagerRepository({}),
      new ChannelInMemoryRepository(),
    );
    const ctx: ChannelValidatorContext = { cacheRepo };

    const results = runValidators(discordChannel, ctx, [
      isTextChannelValidator,
      isTranslateChannelValidator,
      isLinkLimitReachedValidator,
    ]);

    expect(results).resolves.toMatchSnapshot();
  });

  it('should fail validation if not a translate channel', async () => {
    const discordChannel = {
      id: '123',
      type: Discord.ChannelType.GuildText,
    } as Discord.Channel;
    const cacheRepo = new ChannelCacheRepository(
      new CacheManagerRepository({}),
      new ChannelInMemoryRepository(),
    );
    const ctx: ChannelValidatorContext = { cacheRepo };

    const results = runValidators(discordChannel, ctx, [
      isTextChannelValidator,
      isTranslateChannelValidator,
      isLinkLimitReachedValidator,
    ]);

    expect(results).resolves.toMatchSnapshot();
  });

  it('should fail validation if reached linking limit', async () => {
    const id = '123';
    const discordChannel = {
      id,
      type: Discord.ChannelType.GuildText,
    } as Discord.Channel;
    const cacheRepo = new ChannelCacheRepository(
      new CacheManagerRepository({}),
      new ChannelInMemoryRepository(),
    );
    const links: Pick<ZK.Channel, 'links'>['links'] = ['1', '2', '3', '4', '5'];
    const trChannel: ZK.Channel = { _id: id, links } as any;
    await cacheRepo.set(id, trChannel);
    const ctx: ChannelValidatorContext = { cacheRepo };

    const results = runValidators(discordChannel, ctx, [
      isTextChannelValidator,
      isTranslateChannelValidator,
      isLinkLimitReachedValidator,
    ]);

    expect(results).resolves.toMatchSnapshot();
  });
});
