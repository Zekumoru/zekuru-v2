import ChannelLink from '../db/models/ChannelLink';
import channelLinkCache from './channelLinkCache';

jest.mock('../db/models/ChannelLink');

describe('channelLinkCache', () => {
  const mockChannelLink = jest.mocked(ChannelLink);

  const setupFindOneMock = (mockReturnValue: any) => {
    mockChannelLink.findOne.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockReturnValue),
    } as any);
  };

  const setupFindOneMockOnce = (mockReturnValue: any) => {
    mockChannelLink.findOne.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockReturnValue),
    } as any);
  };

  const mockLink = {
    _id: 'mockId',
    id: '123',
    guildId: '456',
    links: [],
    createdAt: new Date(),
  } as any;

  beforeEach(() => {
    channelLinkCache.clear();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new link and store it in the cache', async () => {
      setupFindOneMock(null);
      const mockSave = jest.fn();
      mockChannelLink.mockImplementation(
        () => ({ ...mockLink, save: mockSave } as any)
      );

      const result = await channelLinkCache.create(
        mockLink.id,
        mockLink.guildId
      );

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(mockLink));
    });

    it('should fetch an existing link and store it in the cache', async () => {
      setupFindOneMock(mockLink);

      const result = await channelLinkCache.create(
        mockLink.id,
        mockLink.guildId
      );

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(result).toEqual(expect.objectContaining(mockLink));
    });
  });

  describe('get', () => {
    it('should get a link from the cache if it exists', async () => {
      setupFindOneMock(mockLink);

      await channelLinkCache.get(mockLink.id);
      const result = await channelLinkCache.get(mockLink.id);

      expect(mockChannelLink.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expect.objectContaining(mockLink));
    });

    it('should fetch a link from the database and store it in the cache if it does not exist in the cache', async () => {
      setupFindOneMock(mockLink);

      const result = await channelLinkCache.get(mockLink.id);

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(result).toEqual(expect.objectContaining(mockLink));
    });

    it('should return null if the link does not exist in the database', async () => {
      setupFindOneMock(null);

      const result = await channelLinkCache.get(mockLink.id);

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing link and update the cache', async () => {
      const mockSave = jest.fn().mockResolvedValue({});
      const mockOverwrite = jest.fn();
      setupFindOneMock({
        ...mockLink,
        overwrite: mockOverwrite,
        save: mockSave,
      });

      await channelLinkCache.update(mockLink);

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(mockOverwrite).toHaveBeenCalledWith(mockLink);
      expect(mockSave).toHaveBeenCalled();
      expect(await channelLinkCache.get(mockLink.id)).toEqual(
        expect.objectContaining(mockLink)
      );
    });
  });

  describe('delete', () => {
    it('should delete a link from the database and remove it from the cache', async () => {
      setupFindOneMockOnce(mockLink);
      setupFindOneMockOnce(null);

      await channelLinkCache.delete(mockLink.id);

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(mockChannelLink.deleteOne).toHaveBeenCalledWith({
        id: mockLink.id,
      });
      expect(await channelLinkCache.get(mockLink.id)).toBeNull();
    });

    it('should do nothing if the link does not exist', async () => {
      setupFindOneMock(null);

      await channelLinkCache.delete(mockLink.id);

      expect(mockChannelLink.findOne).toHaveBeenCalledWith({ id: mockLink.id });
      expect(mockChannelLink.deleteOne).not.toHaveBeenCalled();
    });
  });
});
