export const FUNNEL_STEPS = ['quiz_start', 'email_captured', 'paywall_view', 'buy_click'] as const
export type FunnelStep = (typeof FUNNEL_STEPS)[number]

export const PAYWALL_FEATURES = [
  'Personalised marketing roadmap',
  'Ready-to-use templates',
  'Weekly coaching calls',
] as const