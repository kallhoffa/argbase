export const FEATURE_FLAGS = {
  navigation_banner: {
    key: 'navigation_banner',
    default: 'control',
    description: 'Navigation banner variant: control, beta, or next',
  },
};

export const BANNER_VARIANTS = {
  control: 'ArgBase',
  beta: 'ArgBase (beta)',
  next: 'ArgBase (beta)',
};

export const isBannerVariant = (value) => {
  return value === 'beta' || value === 'next';
};
