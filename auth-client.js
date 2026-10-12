class NankaiAccount {
  constructor() {
    this.tokenKey = "nankai-memory-session";
    this.token = window.localStorage.getItem(this.tokenKey) || "";
    this.user = null;
  }

  async request(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const response = await fetch(path, { ...options, headers });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || "档案服务暂时不可用，请稍后重试");
    return body;
  }

  remember(payload) {
    this.token = payload.token;
    this.user = payload.user;
    window.localStorage.setItem(this.tokenKey, this.token);
  }

  async restore() {
    if (!this.token) return null;
    try {
      const payload = await this.request("/api/auth/me");
      this.user = payload.user;
      return this.user;
    } catch {
      this.clear();
      return null;
    }
  }

  async register(fields) {
    const payload = await this.request("/api/auth/register", { method: "POST", body: JSON.stringify(fields) });
    this.remember(payload);
    return payload.user;
  }

  async login(fields) {
    const payload = await this.request("/api/auth/login", { method: "POST", body: JSON.stringify(fields) });
    this.remember(payload);
    return payload.user;
  }

  async logout() {
    try { if (this.token) await this.request("/api/auth/logout", { method: "POST" }); } finally { this.clear(); }
  }

  clear() {
    this.token = "";
    this.user = null;
    window.localStorage.removeItem(this.tokenKey);
  }

  loadSave() { return this.request("/api/game/save"); }
  save(completed) { return this.request("/api/game/save", { method: "PUT", body: JSON.stringify({ completed }) }); }
}

window.nankaiAccount = new NankaiAccount();
