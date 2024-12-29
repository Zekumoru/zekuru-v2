const setResponses = {
  invalid: (input: string) =>
    `The language you provided \`${input}\` is either not supported or invalid. Please choose in the suggestions or type the language code.`,
  askUnsupported: (api: string, languageName: string) =>
    `\`${languageName}\` is not supported by the current API you're using which is \`${api}\`. Will you set anyway?`,
  timedOutUnsupported: (channelId: string) =>
    `Confirmation took too long. Setting <#${channelId}>'s language has been aborted.`,
  cancelUnsupported: (channelId: string) =>
    `Setting <#${channelId}>'s language has been aborted.`,
  newSet: (channelId: string, languageName: string) =>
    `<#${channelId}>'s language has been successfully set to \`${languageName}\`.`,
  alreadySet: (channelId: string, languageName: string) =>
    `<#${channelId}>'s language has already been set to \`${languageName}\`!`,
  askReset: (
    channelId: string,
    languageName: string,
    oldLanguageName: string
  ) =>
    `<#${channelId}>'s language has already been set to \`${oldLanguageName}\`. Do you wish to change it to \`${languageName}\`?`,
  timedOutChange: (channelId: string, oldLanguageName: string) =>
    `Confirmation took too long. <#${channelId}>'s language has not been changed from \`${oldLanguageName}\`.`,
  cancelChange: (channelId: string, oldLanguageName: string) =>
    `<#${channelId}>'s language has not been changed from \`${oldLanguageName}\`.`,
  confirmChange: (channelId: string, languageName: string) =>
    `<#${channelId}>'s language has been changed to \`${languageName}\`.`,
};

export default setResponses;
