const originalModule = jest.requireActual('../linking.ts');

export = {
  ...originalModule,
  CHANNEL_LINK_LIMIT: 3,
};
