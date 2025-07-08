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
} as const;

export type SingleModeOption =
  (typeof SingleOptions.mode)[keyof typeof SingleOptions.mode];

const MultipleOptions = {
  CHANNELS: 'channels',
  RECURSIVE: 'recursive',
} as const;

const CategoryOptions = {
  CATEGORY_CHANNEL: 'category-channel',
} as const;

const LinkOptions = {
  Single: SingleOptions,
  Multiple: MultipleOptions,
  Group: CategoryOptions,
};

export default LinkOptions;
