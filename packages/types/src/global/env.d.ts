declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
    interface ProcessEnv
      extends Partial<{
        NODE_ENV: 'development' | 'production';
        DISCORD_TOKEN: string;
        CLIENT_ID: string;
        GUILD_ID: string;
        MONGODB_CONNECTION_STRING: string;
        CIPHER_SECRET_KEY: string;
        CHANNEL_LINK_LIMIT: string;
      }> {}
  }
}

export {};
