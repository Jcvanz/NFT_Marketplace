export type MockScenario = 
  | 'default'
  | 'empty_catalog'
  | 'slow_network'
  | 'network_error'
  | 'session_expired'
  | 'validation_conflict'
  | 'invalid_coupon'
  | 'price_changed'
  | 'sold_out'
  | 'idempotency_timeout'
  | 'payment_rejected';

const SCENARIO_KEY = 'nft_mock_scenario';

export function getActiveScenario(): MockScenario {
  if (typeof window === 'undefined') return 'default';
  const stored = localStorage.getItem(SCENARIO_KEY) as MockScenario;
  return stored || 'default';
}

export function setActiveScenario(scenario: MockScenario): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SCENARIO_KEY, scenario);
  window.dispatchEvent(new CustomEvent('mock-scenario-changed', { detail: scenario }));
}

export function resetScenario(): void {
  setActiveScenario('default');
}

