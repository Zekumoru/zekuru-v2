# Zekuru-v2 Demo

This is the demo version of Zekuru-v2, a Discord translation bot!

## Introduction

Tired of language barriers in your Discord server?

**Introducing Zekuru-v2, the seamless translation bot for Discord!**

Do you ever find yourself in a Discord server with channels dedicated to different languages? Want to chat with everyone, but language translation is a hassle?  

**Zekuru-v2 fixes that!**  

Connect your language channels and chat freely. My bot automatically translates messages between channels, keeping the conversation flowing. No more copy-pasting or confusing emoji commands!

**Here's what makes Zekuru-v2 awesome:**

- **Effortless Translation:** Just set your channel languages and chat!  Zekuru-v2 translates messages seamlessly in the background.
- **DeepL Powered:** Experience the best translations possible, thanks to DeepL's industry-leading technology.
- **Rich Communication:** Share pictures, stickers, reactions, and attachments - everything gets translated and delivered!
- **Stay in Sync:** Edit or delete messages - the changes reflect in all translated versions.

**Break down language barriers and build a truly global community in your Discord server!**

**Let's bridge the gap and chat together with Zekuru-v2!**

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Supported Languages](#supported-languages)
5. [Commands](#commands)
6. [Contributing](#contributing)
7. [License](#license)

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs) and [yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) installed.

## Installation

To start chatting seamlessly across your different language channels, do the following steps:

1. Clone this repository and enter its directory

```cmd
git clone git@github.com:Zekumoru/zekuru-v2-demo.git
cd zekuru-v2-demo
```

2. Install necessary dependencies

```cmd
yarn
```

3. Create `.env` file and copy-paste the following providing the correct values within those in angle brackets `<>`.

```env
DISCORD_TOKEN=<DISCORD_TOKEN_HERE>
CLIENT_ID=<CLIENT_ID_HERE>
MONGODB_CONNECTION_STRING=<CONNECTION_STRING_HERE>
CIPHER_SECRET_KEY=<SECRET_KEY_HERE>
CHANNEL_LINK_LIMIT=5
DEBUG="zekuru-v2-demo:*"
```

- **DISCORD_TOKEN**

To get a Discord token, follow the steps on the [Setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) article in the official discord.js guide. It also explains what a Discord token is.

- **CLIENT_ID**

To learn about where to find your bot's client id, check the [Guild commands section](https://discordjs.guide/creating-your-bot/command-deployment.html#guild-commands) in the official discord.js guide.

- **MONGODB_CONNECTION_STRING**

To get a MongoDB connection string, follow the two articles in the official MongoDB documentation, especially the instructions for the **Atlas UI** (unless you're a developer and know what you're doing): [Create an Account](https://www.mongodb.com/docs/atlas/tutorial/create-atlas-account/) and [Deploy a Free Cluster](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).

The MongoDB connection string looks like this: `mongodb+srv://[username:password@]host[/[defaultauthdb][?options]]`. **Somewhere along the deployment of a free cluster you will be asked whether to include the password in your connection string, add it! Unless you know what you're doing.**

- **CIPHER_SECRET_KEY**

It's like a password used for encrypting data. It is used for encrypting the API keys fed to the `/set` command. To create a secret key, run the following command:

```cmd
yarn create-cipher-secret
```

**Don't try to be smart and use the secret key generator unless you know what you're doing.**

> **WARNING: Do not forget to generate and put this secret key, otherwise, the bot will use the default key: `58061f4b4543d65ca7967a55ded720355d9b22307c2d665a501dba2d869e1116`.**

- **CHANNEL_LINK_LIMIT**

This is how many channels **can be linked** together. This is not the number of channels you can set with a language. Default is 5.

- **DEBUG**

**Don't try to change its value unless you know what you're doing.** This is used for logging the output of the bot.

4. Run the bot.

```cmd
yarn start
```

> To have the bot running in the background, you can check out [pm2](https://pm2.keymetrics.io/) which is a process manager. Use the following command to run the bot in the background: `pm2 start ts-node --name "Zekuru-v2 Demo" -- --files app.ts`.

5. Invite the bot to your server using the link below replacing `CLIENT_ID_HERE` with your bot's **CLIENT_ID**.

```link
https://discord.com/oauth2/authorize?client_id=CLIENT_ID_HERE&permissions=137976212544&scope=bot+applications.commands
```

6. And start creating channels, setting languages on them, linking those channels, and finally, chatting!

## Supported Languages

As the time of writing, there are currently 30 supported languages by Deepl and they are:

- AR (Arabic)
- BG (Bulgarian)
- CS (Czech)
- DA (Danish)
- DE (German)
- EL (Greek)
- EN (English)
- ES (Spanish)
- ET (Estonian)
- FI (Finnish)
- FR (French)
- HU (Hungarian)
- ID (Indonesian)
- IT (Italian)
- JA (Japanese)
- KO (Korean)
- LI (Lithuanian)
- LV (Latvian)
- NL (Dutch)
- NO (Norwegian)
- PL (Polish)
- PT (Portuguese)
- RO (Romanian)
- RU (Russian)
- SK (Slovak)
- SL (Slovenian)
- SV (Swedish)
- TR (Turkish)
- UK (Ukrainian)
- ZH (Chinese)

You can check the updated list of languages in the [Deepl's Terms and Conditions](https://www.deepl.com/pro-license) which is located on the near bottom of the page.

## Commands

Below is the list of commands available on this bot:

- `/sign-in <api-key: required>`: Sign in using a Deepl's API key to start using the bot.
- `/sign-out`: Signs out the bot. It also removes the Deepl API key from the bot's database.
- `/usage`: Shows the current usage and remaining characters of the Deepl account associated with the Deepl API key used to sign in.
- `/set <channel: optional> <language: required>`: Sets a channel's language.
- `/unset <channel: optional>`: Unset a channel's language.
- `/link <source-channel: optional> <target-channel: required> <mode: optional>`: Links two translate channels unidirectionally `mode:unidirectional`, bidirectionally `mode:bidirectional`, or recursively `mode:recursive`.
- `/link-multiple <channels: required>`: Links multiple channels at once.
- `/unlink <source-channel: optional> <target-channel: required>`: Unlinks two translate channels.
- `/unlink-channel <channel: optional>`: Unlinks channel from all other translate channels.
- `/show-channels`: Shows a list of all translate channels.
- `/show-links <channel: optional>`: Shows the linking of translate channels.

You can also check out the [Zekuru-v2 documentation](https://zekuru-v2.zekumoru.com/) for a full explanation of these commands.

## Contributing

Any issues or pull requests are welcome! Do mind that **this is a demo version** of the actual Zekuru-v2 bot. If you have any ideas or improvements on the bot, go to the [official Zekuru-v2 bot repository](https://github.com/Zekumoru/zekuru-v2) and check if your ideas are already implemented, otherwise feel free to contribute!

Any contributions you make will be under the MIT software license.

## License

This application is licensed under the [MIT license](LICENSE).
