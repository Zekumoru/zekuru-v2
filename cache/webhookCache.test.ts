import { BaseGuildTextChannel, Collection, Webhook } from 'discord.js';
import webhookCache from './webhookCache';

jest.mock('discord.js', () => {
  const mockCollection = {
    get: jest.fn(),
    set: jest.fn(),
    find: jest.fn(),
  };

  return {
    Collection: jest.fn().mockImplementation(() => mockCollection),
    Webhook: jest.fn(),
    BaseGuildTextChannel: jest.fn(),
  };
});

describe('webhookCache', () => {
  const mockCollection: jest.Mocked<Collection<string, Webhook>> = jest
    .mocked(Collection)
    .getMockImplementation()!() as any;
  const mockChannel: jest.Mocked<BaseGuildTextChannel> = {
    id: 'channel-id',
    guildId: 'guild-id',
    fetchWebhooks: jest.fn(),
    createWebhook: jest.fn(),
  } as any;
  const mockWebhook: jest.Mocked<Webhook> = {
    id: 'webhook-id',
    guildId: 'guild-id',
  } as any;

  afterEach(() => {
    mockCollection.find.mockReset();
  });

  it('should return cached webhook if it exists', async () => {
    mockCollection.get.mockReturnValue(mockWebhook);

    const result = await webhookCache.get(mockChannel);

    expect(result).toEqual(mockWebhook);
    expect(mockChannel.fetchWebhooks).not.toHaveBeenCalled();
    expect(mockChannel.createWebhook).not.toHaveBeenCalled();
  });

  it('should fetch and cache the webhook if not cached but exists on server', async () => {
    mockCollection.get.mockReturnValue(undefined);
    mockChannel.fetchWebhooks.mockResolvedValue(new Collection());
    mockCollection.find.mockReturnValue(mockWebhook);

    const result = await webhookCache.get(mockChannel);

    expect(result).toBe(mockWebhook);
    expect(mockChannel.fetchWebhooks).toHaveBeenCalled();
    expect(mockChannel.createWebhook).not.toHaveBeenCalled();
    expect(mockCollection.set).toHaveBeenCalledWith(
      mockChannel.id,
      mockWebhook
    );
  });

  it('should create and cache a new webhook if none exist', async () => {
    mockCollection.get.mockReturnValue(undefined);
    mockChannel.fetchWebhooks.mockResolvedValue(new Collection());
    mockChannel.createWebhook.mockResolvedValue(mockWebhook as any);

    const result = await webhookCache.get(mockChannel);

    expect(result).toBe(mockWebhook);
    expect(mockChannel.fetchWebhooks).toHaveBeenCalled();
    expect(mockChannel.createWebhook).toHaveBeenCalledWith({
      name: 'Zekuru-v2 Webhook',
    });
    expect(mockCollection.set).toHaveBeenCalledWith(
      mockChannel.id,
      mockWebhook
    );
  });
});
