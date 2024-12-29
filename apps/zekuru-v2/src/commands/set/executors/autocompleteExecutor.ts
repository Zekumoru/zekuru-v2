import { AutocompleteExecutor } from '@zekuru-v2/types';
import ApiLanguagesCache from '../../../cache/ApiLanguagesCache';
import GuildCache from '../../../cache/GuildCache';

const setAutocompleteExecutor: AutocompleteExecutor = async (interaction) => {
  if (!interaction.inGuild()) return await interaction.respond([]);

  const guild = await GuildCache.get(interaction.guildId);
  if (!guild) return await interaction.respond([]);

  const api = guild.translation.credentials[0];
  if (!api) return await interaction.respond([]);

  const focused = interaction.options.getFocused().toLowerCase();
  const languages = await ApiLanguagesCache.get(api.type);
  const filtered: { name: string; value: string }[] = [];

  // I am speed. Jokes aside, I'm using a for-loop instead of
  // filter(), slice(), and map() for maximum speed efficiency.
  for (let i = 0; i < languages.length && filtered.length < 25; i++) {
    const { code, name } = languages[i];
    if (code.startsWith(focused) || name.toLowerCase().includes(focused)) {
      filtered.push({ name, value: code });
    }
  }

  await interaction.respond(filtered);
};

export default setAutocompleteExecutor;
