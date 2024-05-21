declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: 'development' | 'production';
      DISCORD_TOKEN?: string;
      CLIENT_ID?: string;
      GUILD_ID?: string;
      MONGODB_CONNECTION_STRING?: string;
      CIPHER_SECRET_KEY?: string;
      CHANNEL_LINK_LIMIT?: string;
    }
  }
}

export {};
