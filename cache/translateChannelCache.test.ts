import TranslateChannel from '../db/models/TranslateChannel';
import type { ITranslateChannel } from '../db/models/TranslateChannel';
import translateChannelCache from './translateChannelCache';

jest.mock('../db/models/TranslateChannel');

describe('translateChannelCache', () => {
  const mockTranslateChannel = jest.mocked(TranslateChannel);

  const setupFindOneMock = (mockReturnValue: any) => {
    mockTranslateChannel.findOne.mockReturnValue(mockReturnValue);
  };

  const setupFindOneMockOnce = (mockReturnValue: any) => {
    mockTranslateChannel.findOne.mockReturnValueOnce(mockReturnValue);
  };

  const mockTrChannel: ITranslateChannel = {
    _id: 'mockId',
    id: '123',
    guildId: '456',
    sourceLang: 'en',
    targetLang: 'ja',
    createdAt: new Date(),
  } as any;

  beforeEach(() => {
    translateChannelCache.clear();
    jest.clearAllMocks();
  });

  describe('set/get', () => {
    it('should set a new translate channel and store it in cache', async () => {
      setupFindOneMock(null);
      const mockSave = jest.fn();
      const mockOverwrite = jest.fn();
      mockTranslateChannel.mockImplementation(
        () =>
          ({
            ...mockTrChannel,
            overwrite: mockOverwrite,
            save: mockSave,
          } as any)
      );

      await translateChannelCache.set(
        mockTrChannel.id,
        mockTrChannel.guildId,
        mockTrChannel.sourceLang,
        mockTrChannel.targetLang
      );

      expect(mockTranslateChannel.findOne).toHaveBeenCalledWith({
        id: mockTrChannel.id,
      });
      expect(mockOverwrite).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(await translateChannelCache.get(mockTrChannel.id)).toEqual(
        mockTrChannel
      );
    });
  });

  describe('get', () => {
    it('should fetch an existing translate channel from the database and store it in cache', async () => {
      setupFindOneMock(mockTrChannel);

      const result = await translateChannelCache.get(mockTrChannel.id);

      expect(mockTranslateChannel.findOne).toHaveBeenCalledWith({
        id: mockTrChannel.id,
      });
      expect(result).toEqual(mockTrChannel);
    });

    it('should return null if translate channel does not exist in the database', async () => {
      setupFindOneMock(null);

      const result = await translateChannelCache.get(mockTrChannel.id);

      expect(mockTranslateChannel.findOne).toHaveBeenCalledWith({
        id: mockTrChannel.id,
      });
      expect(result).toBeNull();
    });

    it('should get from the cache if it already stored there', async () => {
      setupFindOneMock(mockTrChannel);

      await translateChannelCache.get(mockTrChannel.id);
      const result = await translateChannelCache.get(mockTrChannel.id);

      expect(mockTranslateChannel.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTrChannel);
    });
  });

  describe('unset', () => {
    it('should delete a translate channel from the database and remove it from the cache', async () => {
      setupFindOneMockOnce(mockTrChannel);
      setupFindOneMockOnce(null);

      await translateChannelCache.unset(mockTrChannel.id);

      expect(mockTranslateChannel.findOne).toHaveBeenCalledWith({
        id: mockTrChannel.id,
      });
      expect(mockTranslateChannel.deleteOne).toHaveBeenCalledWith({
        id: mockTrChannel.id,
      });
      expect(await translateChannelCache.get(mockTrChannel.id)).toBeNull();
    });

    it('should do nothing if the translate channel does not exist', async () => {
      setupFindOneMock(null);

      await translateChannelCache.unset(mockTrChannel.id);

      expect(mockTranslateChannel.deleteOne).not.toHaveBeenCalled();
    });
  });
});
