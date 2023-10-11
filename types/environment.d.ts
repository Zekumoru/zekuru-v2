// indicates that this file is a module
export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string,
            CLIENT_ID: string,
            TEST_GUILD_ID: string
        }
    }
}
