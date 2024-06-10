import ChannelLink, { IChannelLink } from '../db/models/ChannelLink';
import channelLinkCache from './channelLinkCache';

jest.mock('../db/models/ChannelLink');

describe('channelLinkCache', () => {
  const mockChannelLink = jest.mocked(ChannelLink);

  beforeEach(() => {
    channelLinkCache.clear();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new link and store it in the cache', async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      const mockFindOne = mockChannelLink.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);
      mockChannelLink.mockImplementation(
        () => ({ id: '123', guildId: '456', links: [], save: mockSave } as any)
      );

      const channelId = '123';
      const guildId = '456';

      const result = await channelLinkCache.create(channelId, guildId);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelId });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          guildId,
          id: channelId,
          links: [],
        })
      );
    });

    it('should fetch an existing link and store it in the cache', async () => {
      const mockFindOne = mockChannelLink.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'mockId',
          id: '123',
          guildId: '456',
          links: [],
          createdAt: new Date(),
        }),
      } as any);

      const channelId = '123';
      const guildId = '456';

      const result = await channelLinkCache.create(channelId, guildId);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelId });
      expect(result).toEqual(
        expect.objectContaining({
          guildId,
          id: channelId,
          links: [],
        })
      );
    });
  });

  describe('get', () => {
    it.todo('should get a link from the cache if it exists');

    it('should fetch a link from the database and store it in the cache if it does not exist in the cache', async () => {
      const mockFindOne = mockChannelLink.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'mockId',
          id: '123',
          guildId: '456',
          links: [],
          createdAt: new Date(),
        }),
      } as any);

      const channelId = '123';

      const result = await channelLinkCache.get(channelId);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelId });
      expect(result).toEqual(
        expect.objectContaining({
          id: channelId,
          links: [],
        })
      );
    });

    it('should return null if the link does not exist in the database', async () => {
      const mockFindOne = mockChannelLink.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const channelId = '123';

      const result = await channelLinkCache.get(channelId);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelId });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing link and update the cache', async () => {
      const link: IChannelLink = {
        _id: 'linkId',
        id: '789',
        guildId: '000',
        links: [],
        createdAt: new Date(),
      } as any;

      const mockSave = jest.fn().mockResolvedValue({});
      const mockOverwrite = jest.fn().mockReturnValue({});
      const mockFindOne = mockChannelLink.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'mockId',
          id: '123',
          guildId: '456',
          links: [link],
          overwrite: mockOverwrite,
          save: mockSave,
        }),
      } as any);

      const channelLink: IChannelLink = {
        _id: 'mockId',
        id: '123',
        guildId: '456',
        links: [link],
        createdAt: new Date(),
      } as any;

      await channelLinkCache.update(channelLink);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelLink.id });
      expect(mockOverwrite).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(await channelLinkCache.get(channelLink.id)).toEqual(
        expect.objectContaining({
          links: expect.arrayContaining([link]),
        })
      );
    });
  });

  describe('delete', () => {
    it('should delete a link from the database and remove it from the cache', async () => {
      const mockDeleteOne = mockChannelLink.deleteOne.mockResolvedValue(
        {} as any
      );
      const mockFindOne = mockChannelLink.findOne;
      mockFindOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          _id: 'mockId',
          id: '123',
          guildId: '456',
          links: [],
          createdAt: new Date(),
        }),
      } as any);
      mockFindOne.mockReturnValueOnce({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const channelId = '123';

      await channelLinkCache.delete(channelId);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelId });
      expect(mockDeleteOne).toHaveBeenCalledWith({ id: channelId });
      expect(await channelLinkCache.get(channelId)).toBeNull();
    });

    it('should do nothing if the link does not exist', async () => {
      const mockFindOne = mockChannelLink.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      } as any);

      const channelId = '123';

      await channelLinkCache.delete(channelId);

      expect(mockFindOne).toHaveBeenCalledWith({ id: channelId });
      expect(mockChannelLink.deleteOne).not.toHaveBeenCalled();
    });
  });
});
