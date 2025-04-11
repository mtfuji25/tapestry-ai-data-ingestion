// src/utils/ProxyManager.ts
import dotenv from 'dotenv';
dotenv.config();

export class ProxyManager {
  private proxies: string[];
  private index: number;

  constructor(proxyList?: string) {
    // If proxyList is provided, split it by comma; otherwise, read from env variable.
    if (proxyList) {
      this.proxies = proxyList.split(',').map(p => p.trim()).filter(p => p.length > 0);
    } else {
      const envProxies = process.env.PROXY_LIST || "";
      this.proxies = envProxies.split(',').map(p => p.trim()).filter(p => p.length > 0);
    }
    this.index = 0;
  }

  /**
   * Returns the next proxy in a rotating fashion.
   */
  public getNextProxy(): string | null {
    if (this.proxies.length === 0) {
      return null;
    }
    const proxy = this.proxies[this.index];
    this.index = (this.index + 1) % this.proxies.length;
    return proxy;
  }
}
