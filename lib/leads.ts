import { JOTFORM_URL } from "../config/leads";

export type LeadContext = {
  requestType?: string;
  service?: string;
  branch?: string;
  products?: string;
  amount?: string;
};

export function buildLeadFormUrl(
  context: LeadContext,
  formUrl: string = JOTFORM_URL,
): string | null {
  try {
    const url = new URL(formUrl);
    if (
      url.protocol !== "https:" ||
      !["form.jotform.com", "eu.jotform.com"].includes(url.hostname) ||
      !/^\/\d+\/?$/.test(url.pathname) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    for (const [key, value] of Object.entries(context)) {
      if (value) url.searchParams.set(key, value);
    }
    return url.toString();
  } catch {
    return null;
  }
}
