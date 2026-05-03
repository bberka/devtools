'use client';

import { useMemo, useState } from 'react';
import { ArrowRightLeft, Check, Copy, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActionButton, useCopyToClipboard } from '@/hooks';

type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
};

type RateResponse = {
  date: string;
  base: string;
  quote: string;
  rate: number;
};

type ConversionResult = {
  amount: number;
  convertedAmount: number;
  base: string;
  quote: string;
  rate: number;
  date: string;
};

const CURRENCIES: CurrencyOption[] = [
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kc' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zl' },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

function parseNumber(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/,/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, maximumFractionDigits = 6): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: Math.min(2, maximumFractionDigits),
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function getCurrencyLabel(currency: CurrencyOption): string {
  return `${currency.code} · ${currency.name}`;
}

export function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState('');

  const { executeAction, isLoading } = useActionButton();
  const copyResult = useCopyToClipboard();

  const fromCurrencyInfo = useMemo(
    () => CURRENCIES.find((currency) => currency.code === fromCurrency),
    [fromCurrency]
  );
  const toCurrencyInfo = useMemo(
    () => CURRENCIES.find((currency) => currency.code === toCurrency),
    [toCurrency]
  );

  const convertCurrency = async () => {
    setError('');
    setResult(null);

    const parsedAmount = parseNumber(amount);

    if (parsedAmount === null) {
      setError('Enter a valid amount to convert.');
      return;
    }

    if (parsedAmount < 0) {
      setError('Amount cannot be negative.');
      return;
    }

    if (fromCurrency === toCurrency) {
      setResult({
        amount: parsedAmount,
        convertedAmount: parsedAmount,
        base: fromCurrency,
        quote: toCurrency,
        rate: 1,
        date: date || new Date().toISOString().slice(0, 10),
      });
      return;
    }

    const params = new URLSearchParams();
    if (date) {
      params.set('date', date);
    }

    const query = params.toString();
    const url = `https://api.frankfurter.dev/v2/rate/${fromCurrency}/${toCurrency}${query ? `?${query}` : ''}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        let message = 'Failed to fetch exchange rate.';

        try {
          const data = (await response.json()) as { message?: string };
          if (data.message) {
            message = data.message;
          }
        } catch {}

        throw new Error(message);
      }

      const data = (await response.json()) as RateResponse;

      setResult({
        amount: parsedAmount,
        convertedAmount: parsedAmount * data.rate,
        base: data.base,
        quote: data.quote,
        rate: data.rate,
        date: data.date,
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to fetch exchange rate.'
      );
    }
  };

  const handleConvert = async () => {
    await executeAction(convertCurrency);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleClear = () => {
    setAmount('');
    setFromCurrency('USD');
    setToCurrency('EUR');
    setDate('');
    setResult(null);
    setError('');
  };

  const copyValue = result
    ? `${formatNumber(result.convertedAmount, 4)} ${result.quote}`
    : '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Currency Converter</CardTitle>
          <CardDescription>
            Convert currencies using live reference rates fetched in the browser on demand.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="currency-amount" className="mb-2 block text-sm font-medium">
              Amount
            </label>
            <Input
              id="currency-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount((event.target as HTMLInputElement).value)}
              placeholder="100"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-medium">From</label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {getCurrencyLabel(currency)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center lg:pb-0.5">
              <Button
                onClick={handleSwap}
                variant="outline"
                size="icon"
                aria-label="Swap currencies"
                className="h-11 w-full sm:w-11 lg:h-10 lg:w-10"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">To</label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {getCurrencyLabel(currency)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label htmlFor="currency-date" className="mb-2 block text-sm font-medium">
              Reference date
            </label>
            <Input
              id="currency-date"
              type="date"
              value={date}
              onChange={(event) => setDate((event.target as HTMLInputElement).value)}
              max={new Date().toISOString().slice(0, 10)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Leave blank to use the latest available rate.
            </p>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleConvert} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Convert
                </>
              )}
            </Button>
            <Button onClick={handleClear} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              onClick={() => copyResult.copyToClipboard(copyValue)}
              variant={copyResult.isCopied ? 'default' : 'outline'}
              disabled={!copyValue}
            >
              {copyResult.isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy result
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
          <CardDescription>
            {result
              ? `Reference date: ${formatDate(result.date)}`
              : 'Run a conversion to see the latest result.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
            {result
              ? `${formatNumber(result.convertedAmount, 4)} ${result.quote}`
              : '-'}
          </div>

          {result && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Conversion
                </div>
                <div className="mt-1 font-semibold">
                  {formatNumber(result.amount, 4)} {result.base} ={' '}
                  {formatNumber(result.convertedAmount, 4)} {result.quote}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Exchange rate
                </div>
                <div className="mt-1 font-semibold">
                  1 {result.base} = {formatNumber(result.rate, 6)} {result.quote}
                </div>
              </div>
              <div className="rounded-md border bg-card p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Symbols
                </div>
                <div className="mt-1 font-semibold">
                  {(fromCurrencyInfo?.symbol ?? result.base)} to{' '}
                  {(toCurrencyInfo?.symbol ?? result.quote)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Rates are fetched from Frankfurter when you click convert. These are reference rates and can change as newer published data becomes available.
        </CardContent>
      </Card>
    </div>
  );
}
