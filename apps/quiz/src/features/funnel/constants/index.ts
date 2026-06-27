export const FUNNEL_STEPS = ['quiz_start', 'quiz_cta_click', 'email_view', 'email_submit', 'paywall_view', 'buy_click'] as const
export type FunnelStep = (typeof FUNNEL_STEPS)[number]

export const PAYWALL_FEATURES = [
  'Personalised marketing roadmap',
  'Ready-to-use templates',
  'Weekly coaching calls',
] as const