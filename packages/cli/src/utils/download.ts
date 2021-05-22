import axios, { AxiosError } from "axios";

export interface DownloadConfig {
  maxAttempts: number;
  initialTimeoutInMs: number;
  exponentialBackoffFactor: number;
}

const defaultConfig: DownloadConfig = {
  maxAttempts: 3,
  initialTimeoutInMs: 10000,
  exponentialBackoffFactor: 1.5,
};

export async function downloadTextFile(url: string, config?: DownloadConfig): Promise<string> {
  const effectiveConfig = { ...defaultConfig, ...config };
  return downloadHelper(url, {
    attemptsLeft: effectiveConfig.maxAttempts,
    timeoutInMs: effectiveConfig.initialTimeoutInMs,
    exponentialBackoffFactor: effectiveConfig.exponentialBackoffFactor,
  });
}

interface DownloadHelperConfig {
  attemptsLeft: number;
  timeoutInMs: number;
  exponentialBackoffFactor: number;
}

async function downloadHelper(url: string, config: DownloadHelperConfig): Promise<string> {
  const { timeoutInMs, attemptsLeft, exponentialBackoffFactor } = config;

  try {
    const response = await axios.get(url, { timeout: timeoutInMs });
    const responseText = response.data;
    if (response.status !== 200) {
      throw new Error(`[download] Error download ${url}, status ${response.status}`);
    }

    if (typeof responseText !== "string") {
      throw new Error(`[download] Error download ${url}, unexpected response encoding`);
    }

    return responseText;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.log(
      `[download] ${attemptsLeft - 1} attempts left, error download ${url}`,
      axiosError?.code ?? axiosError?.message ?? axiosError
    );

    if (attemptsLeft - 1 === 0) throw new Error(`[download] Limit reached for max number of failed attempts`);

    return downloadHelper(url, {
      attemptsLeft: attemptsLeft - 1,
      timeoutInMs: timeoutInMs * exponentialBackoffFactor,
      exponentialBackoffFactor,
    });
  }
}
