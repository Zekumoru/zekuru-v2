export type LinkMode = 'non-recursive' | 'recursive' | 'adjacent';

export interface LinkOptions {
  mode: LinkMode;
  // If the link type is `single` then this is true otherwise that means
  // the link type is `multiple` or `category`.
  single?: boolean;
  // On `multiple` or `category` mode, this `mono` option is meaningless since
  // the source channels will reflect the target channels so even if this is
  // true, it won't take any effect.
  mono?: boolean;
}
