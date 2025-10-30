"use client";

import posthog from "posthog-js";
import { datadogRum } from "@datadog/browser-rum";
import * as Sentry from "@sentry/browser";

let initialized = false;

interface MonitoringOptions {
  posthogKey?: string;
  posthogHost?: string;
  sentryDsn?: string;
  datadog?: {
    applicationId: string;
    clientToken: string;
    site?: string;
    service?: string;
    env?: string;
  };
}

function getOptionsFromEnv(): MonitoringOptions {
  return {
    posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    datadog:
      process.env.NEXT_PUBLIC_DATADOG_APP_ID && process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
        ? {
            applicationId: process.env.NEXT_PUBLIC_DATADOG_APP_ID,
            clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
            site: process.env.NEXT_PUBLIC_DATADOG_SITE,
            service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
            env: process.env.NEXT_PUBLIC_DATADOG_ENV,
          }
        : undefined,
  } satisfies MonitoringOptions;
}

export function initMonitoring(customOptions?: MonitoringOptions) {
  if (initialized || typeof window === "undefined") {
    return;
  }

  const options = customOptions ?? getOptionsFromEnv();

  if (options.posthogKey) {
    posthog.init(options.posthogKey, {
      api_host: options.posthogHost ?? "https://app.posthog.com",
      capture_pageview: true,
      autocapture: true,
    });
  }

  if (options.sentryDsn) {
    Sentry.init({
      dsn: options.sentryDsn,
      integrations: [],
      tracesSampleRate: 0.2,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
    });
  }

  if (options.datadog) {
    datadogRum.init({
      applicationId: options.datadog.applicationId,
      clientToken: options.datadog.clientToken,
      site: options.datadog.site ?? "datadoghq.com",
      service: options.datadog.service ?? "dsi-ihale-ai",
      env: options.datadog.env ?? process.env.NODE_ENV ?? "development",
      sessionSampleRate: 50,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
    });
  }

  initialized = true;
}

export function flushMonitoring() {
  if (typeof window === "undefined") {
    return;
  }

  // PostHog shutdown method might not exist
  if (typeof (posthog as any).shutdown === 'function') {
    (posthog as any).shutdown();
  }
  Sentry.close?.();
  datadogRum.stopSession?.();
  initialized = false;
}
