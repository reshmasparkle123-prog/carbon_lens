// CarbonLens - Security & Input Validation Module

const Security = {
  // Sanitize user inputs to prevent XSS
  sanitizeInput(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  // Validate numeric inputs
  validateNumber(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    if (isNaN(num)) return min;
    return Math.min(Math.max(num, min), max);
  },

  // Validate select options against allowed values
  validateSelect(value, allowedValues) {
    return allowedValues.includes(value) ? value : allowedValues[0];
  },

  // Rate limiting for API calls
  rateLimiter: {
    calls: [],
    maxCalls: 10,
    windowMs: 60000,
    isAllowed() {
      const now = Date.now();
      this.calls = this.calls.filter(t => now - t < this.windowMs);
      if (this.calls.length >= this.maxCalls) return false;
      this.calls.push(now);
      return true;
    }
  },

  // Content Security Policy meta tag
  applyCSP() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; connect-src https://api.anthropic.com; img-src 'self' data:;";
    document.head.prepend(meta);
  }
};

if (typeof module !== 'undefined') module.exports = Security;
