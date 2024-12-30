const SingleOptions = {
  SOURCE_CHANNEL: 'source-channel',
  TARGET_CHANNEL: 'target-channel',
  MODE: 'mode',
  mode: {
    UNIDIRECTIONAL: 'unidirectional',
    BIDIRECTIONAL: 'bidirectional',
    MONO_ADJACENT: 'mono-adjacent',
    BI_ADJACENT: 'bi-adjacent',
    MONO_RECURSIVE: 'mono-recursive',
    BI_RECURSIVE: 'bi-recursive',
  },
};

const MultipleOptions = {
  CHANNELS: 'channels',
  RECURSIVE: 'recursive',
};

const GroupOptions = {
  CATEGORY_CHANNEL: 'category-channel',
};

const LinkOptions = {
  Single: SingleOptions,
  Multiple: MultipleOptions,
  Group: GroupOptions,
};

export default LinkOptions;
