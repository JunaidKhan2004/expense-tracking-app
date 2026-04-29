const API_URL = 'https://open.er-api.com/v6/latest/';

export interface ExchangeRates {
  [key: string]: number;
}

export async function getExchangeRates(baseCurrency: string): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(`${API_URL}${baseCurrency}`);
    const data = await response.json();
    if (data.result === 'success') {
      return data.rates;
    }
    return null;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

export function convertAmount(amount: number, rate: number): number {
  return Number((amount * rate).toFixed(2));
}
