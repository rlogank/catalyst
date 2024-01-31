import { getLocale } from "next-intl/server";

const defaultLocale = 'en-US';

const userLocale = await getLocale() || defaultLocale;

// todo - add locale resolution logic based on store, channel, and browser settings

export function currencyFormatterForCurrencyAndLocale(currencyCode: string, locale?: string) {
    const resolvedLocale = locale || userLocale;
    return new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency: currencyCode,
    });
}

export function currencyFormatterForCurrency(currencyCode: string) {
    return currencyFormatterForCurrencyAndLocale(currencyCode);
}