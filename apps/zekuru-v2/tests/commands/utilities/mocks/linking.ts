const originalModule = jest.requireActual(
  '../../../../src/commands/utilities/linking.ts'
);

export = {
  ...originalModule,
  CHANNEL_LINK_LIMIT: 3,
};
