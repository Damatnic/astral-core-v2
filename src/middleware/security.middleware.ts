/**
 * Comprehensive Security Middleware for CoreV2
 * Implements OWASP best practices and HIPAA compliance
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createHash, randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { getSecurityConfigForEnvironment } from '../config/security.config';
import { isProduction, isStaging } from '../utils/envValidator';

const securityConfig = getSecurityConfigForEnvironment(
  (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'production'
);

/**
 * Content Security Policy Middleware
 */
export const cspMiddleware = () => {
  const generateNonce = () => randomBytes(16).toString('base64');
  
  return (_req: Request, res: Response, next: NextFunction) => {
    const nonce = generateNonce();
    res.locals.nonce = nonce;
    
    const directives = { ...securityConfig.csp.directives };
    
    if (securityConfig.csp.nonce) {
      directives.scriptSrc = directives.scriptSrc.map(src => 
        src === "'nonce-{nonce}'" ? `'nonce-${nonce}'` : src
      );
    }
    
    const cspHeader = Object.entries(directives)
      .map(([key, value]) => {
        const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (typeof value === 'boolean') {
          return value ? directive : '';
        }
        return `${directive} ${Array.isArray(value) ? value.join(' ') : value}`;
      })
      .filter(Boolean)
      .join('; ');
    
    res.setHeader(
      securityConfig.csp.reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
      cspHeader
    );
    
    next();
  };
};

/**
 * OWASP Security Headers Middleware
 */
export const securityHeadersMiddleware = () => {
  return helmet({
    contentSecurityPolicy: false, // We handle CSP separately
    hsts: securityConfig.securityHeaders.hsts.enabled ? {
      maxAge: securityConfig.securityHeaders.hsts.maxAge,
      includeSubDomains: securityConfig.securityHeaders.hsts.includeSubDomains,
      preload: securityConfig.securityHeaders.hsts.preload,
    } : false,
    frameguard: securityConfig.securityHeaders.xFrameOptions.enabled ? {
      action: securityConfig.securityHeaders.xFrameOptions.value.toLowerCase() as unknown,
    } : false,
    noSniff: securityConfig.securityHeaders.xContentTypeOptions.nosniff,
    referrerPolicy: securityConfig.securityHeaders.referrerPolicy.enabled ? {
      policy: securityConfig.securityHeaders.referrerPolicy.policy as unknown,
    } : false,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    originAgentCluster: true,
    dnsPrefetchControl: { allow: false },
    ieNoOpen: true,
    hidePoweredBy: true,
  });
};

/**
 * Rate Limiting Middleware Factory
 */
export const createRateLimiter = (config: typeof securityConfig.rateLimiting.global) => {
  const limiterConfig = {
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: config.skipSuccessfulRequests,
    skipFailedRequests: config.skipFailedRequests,
  };

  if (process.env.REDIS_URL && config.store === 'redis') {
    limiterConfig.store = new RedisStore({
      client: require('../utils/redis').redisClient,
      prefix: 'rate-limit:',
    });
  }

  return rateLimit(limiterConfig);
};

/**
 * Global Rate Limiter
 */
export const globalRateLimiter = createRateLimiter(securityConfig.rateLimiting.global);

/**
 * API Rate Limiter
 */
export const apiRateLimiter = createRateLimiter(securityConfig.rateLimiting.api);

/**
 * Auth Rate Limiter
 */
export const authRateLimiter = createRateLimiter(securityConfig.rateLimiting.auth);

/**
 * Crisis Endpoint Rate Limiter (More permissive)
 */
export const crisisRateLimiter = createRateLimiter(securityConfig.rateLimiting.crisis);

/**
 * CORS Middleware
 */
export const corsMiddleware = () => {
  const corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
      if (!origin || securityConfig.cors.origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: securityConfig.cors.credentials,
    methods: securityConfig.cors.methods,
    allowedHeaders: securityConfig.cors.allowedHeaders,
    exposedHeaders: securityConfig.cors.exposedHeaders,
    maxAge: securityConfig.cors.maxAge,
    preflightContinue: securityConfig.cors.preflightContinue,
    optionsSuccessStatus: securityConfig.cors.optionsSuccessStatus,
  };

  return require('cors')(corsOptions);
};

/**
 * JWT Authentication Middleware
 */
export const jwtAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, securityConfig.session.jwt.secret, {
      algorithms: [securityConfig.session.jwt.algorithm as unknown],
      issuer: securityConfig.session.jwt.issuer,
      audience: securityConfig.session.jwt.audience,
    });
    
    (req as unknown).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Session Validation Middleware
 */
export const sessionValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const session = (req as unknown).session;
  
  if (!session || !session.userId) {
    return res.status(401).json({ error: 'Valid session required' });
  }

  // Check session timeout
  const lastActivity = session.lastActivity || Date.now();
  const timeout = securityConfig.session.security.sessionTimeout;
  
  if (Date.now() - lastActivity > timeout) {
    session.destroy((err: unknown) => {
      if (err) console.error('Session destruction error:', err);
    });
    return res.status(401).json({ error: 'Session expired' });
  }

  // Update last activity
  session.lastActivity = Date.now();
  next();
};

/**
 * API Key Authentication Middleware
 */
export const apiKeyAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.apiSecurity.authentication.apiKeyRequired) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  // Validate API key (implement your validation logic)
  const isValidApiKey = validateApiKey(apiKey);
  
  if (!isValidApiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  next();
};

/**
 * Input Sanitization Middleware
 */
export const inputSanitizationMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (!securityConfig.apiSecurity.validation.inputSanitization) {
    return next();
  }

  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove dangerous characters and patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

/**
 * SQL Injection Protection Middleware
 */
export const sqlInjectionProtectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.apiSecurity.validation.sqlInjectionProtection) {
    return next();
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  ];

  const checkForSQLInjection = (value: unknown): boolean => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const validateObject = (obj: any): boolean => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (checkForSQLInjection(value)) {
          return true;
        }
        if (typeof value === 'object' && value !== null) {
          if (validateObject(value)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  if (validateObject(req.body) || validateObject(req.query) || validateObject(req.params)) {
    return res.status(400).json({ error: 'Potential SQL injection detected' });
  }

  next();
};

/**
 * XSS Protection Middleware
 */
export const xssProtectionMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.apiSecurity.validation.xssProtection) {
    return next();
  }

  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

/**
 * Device Fingerprinting Middleware
 */
export const deviceFingerprintMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.zeroTrust.verifyExplicitly.requireDeviceFingerprinting) {
    return next();
  }

  const fingerprint = req.headers['x-device-fingerprint'] as string;
  
  if (!fingerprint) {
    return res.status(400).json({ error: 'Device fingerprint required' });
  }

  // Validate fingerprint (implement your validation logic)
  const isValidFingerprint = validateDeviceFingerprint(fingerprint, req);
  
  if (!isValidFingerprint) {
    return res.status(401).json({ error: 'Invalid device fingerprint' });
  }

  next();
};

/**
 * Crisis Override Middleware
 */
export const crisisOverrideMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const crisisHeader = req.headers['x-crisis-override'] as string;
  
  if (crisisHeader === 'true' && securityConfig.crisis.emergencyOverrides.enabled) {
    // Log crisis access
    console.log('CRISIS OVERRIDE ACTIVATED', {
      ip: req.ip,
      user: (req as unknown).user?.id,
      timestamp: new Date().toISOString(),
      endpoint: req.path,
    });
    
    // Bypass certain security checks for crisis situations
    (req as unknown).crisisMode = true;
    
    // Skip rate limiting for crisis
    if (securityConfig.crisis.emergencyOverrides.bypassRateLimiting) {
      (req as unknown).skipRateLimit = true;
    }
  }
  
  next();
};

/**
 * HTTPS Enforcement Middleware
 * Redirects all HTTP traffic to HTTPS in production/staging
 */
export const httpsEnforcementMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only enforce HTTPS in production and staging
  if (!isProduction() && !isStaging()) {
    return next();
  }

  // Check if request is already HTTPS
  const isHttps = req.secure || 
                  req.headers['x-forwarded-proto'] === 'https' ||
                  req.protocol === 'https';

  if (!isHttps) {
    // Special handling for crisis endpoints - allow HTTP but log warning
    if (req.path.includes('/crisis') || (req as unknown).crisisMode) {
      console.warn('⚠️ Crisis endpoint accessed over HTTP', {
        ip: req.ip,
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      // Set security warning header
      res.setHeader('X-Security-Warning', 'Insecure-Connection');
    } else {
      // Redirect to HTTPS
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      console.log('Redirecting HTTP to HTTPS:', httpsUrl);
      return res.redirect(301, httpsUrl);
    }
  }

  // Add Strict-Transport-Security header for HTTPS connections
  if (isHttps && securityConfig.securityHeaders.hsts.enabled) {
    const hstsValue = `max-age=${securityConfig.securityHeaders.hsts.maxAge}`;
    const includeSubDomains = securityConfig.securityHeaders.hsts.includeSubDomains 
      ? '; includeSubDomains' : '';
    const preload = securityConfig.securityHeaders.hsts.preload ? '; preload' : '';
    
    res.setHeader('Strict-Transport-Security', `${hstsValue}${includeSubDomains}${preload}`);
  }

  next();
};

/**
 * TLS Version Check Middleware
 * Ensures minimum TLS version in production
 */
export const tlsVersionCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!isProduction()) {
    return next();
  }

  // Get TLS version from the connection
  const tlsSocket = (req as unknown).socket;
  if (tlsSocket && tlsSocket.getPeerCertificate) {
    const tlsVersion = tlsSocket.getProtocol ? tlsSocket.getProtocol() : null;
    
    // Check if TLS version meets minimum requirements
    const minTlsVersion = process.env.MIN_TLS_VERSION || 'TLSv1.2';
    const acceptedVersions = ['TLSv1.2', 'TLSv1.3'];
    
    if (tlsVersion && !acceptedVersions.includes(tlsVersion)) {
      console.error('TLS version too old:', {
        version: tlsVersion,
        minRequired: minTlsVersion,
        ip: req.ip,
      });
      
      return res.status(426).json({
        error: 'Upgrade Required',
        message: `Minimum TLS version ${minTlsVersion} required`,
      });
    }
  }

  next();
};

/**
 * Certificate Pinning Middleware
 * Validates client certificates in high-security environments
 */
export const certificatePinningMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only enforce in production with certificate pinning enabled
  if (!isProduction() || !securityConfig.encryption.inTransit.certificatePinning) {
    return next();
  }

  const tlsSocket = (req as unknown).socket;
  if (tlsSocket && tlsSocket.getPeerCertificate) {
    const cert = tlsSocket.getPeerCertificate();
    
    if (cert && cert.fingerprint) {
      // Get expected certificate fingerprints from environment
      const expectedFingerprints = process.env.CERT_FINGERPRINTS?.split(',') || [];
      
      if (expectedFingerprints.length > 0 && !expectedFingerprints.includes(cert.fingerprint)) {
        console.error('Certificate pinning failed:', {
          received: cert.fingerprint,
          ip: req.ip,
        });
        
        return res.status(403).json({
          error: 'Certificate validation failed',
        });
      }
    }
  }

  next();
};

/**
 * Audit Logging Middleware
 */
export const auditLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.audit.enabled) {
    return next();
  }

  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const auditLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      userId: (req as unknown).user?.id,
      statusCode: res.statusCode,
      duration,
      crisisMode: (req as unknown).crisisMode || false,
    };
    
    // Log to audit system (implement your audit logging)
    logAuditEvent(auditLog);
  });
  
  next();
};

// Helper functions (implement these based on your needs)
function validateApiKey(apiKey: string): boolean {
  // Implement API key validation logic
  return apiKey === process.env.INTERNAL_API_KEY;
}

function validateDeviceFingerprint(fingerprint: string, req: Request): boolean {
  // Implement device fingerprint validation logic
  const expectedFingerprint = createHash('sha256')
    .update(req.headers['user-agent'] || '')
    .update(req.ip || '')
    .digest('hex');
  
  return fingerprint === expectedFingerprint;
}

function logAuditEvent(event: Event): void {
  // Implement audit logging logic
  console.log('AUDIT:', JSON.stringify(event));
}

/**
 * Compose all security middleware
 */
export const securityMiddleware = [
  httpsEnforcementMiddleware,
  tlsVersionCheckMiddleware,
  securityHeadersMiddleware(),
  cspMiddleware(),
  corsMiddleware(),
  globalRateLimiter,
  inputSanitizationMiddleware,
  sqlInjectionProtectionMiddleware,
  xssProtectionMiddleware,
  deviceFingerprintMiddleware,
  auditLoggingMiddleware,
];

/**
 * Auth-specific middleware composition
 */
export const authMiddleware = [
  httpsEnforcementMiddleware,
  jwtAuthMiddleware,
  sessionValidationMiddleware,
];

/**
 * API-specific middleware composition
 */
export const apiMiddleware = [
  httpsEnforcementMiddleware,
  apiRateLimiter,
  apiKeyAuthMiddleware,
  inputSanitizationMiddleware,
  sqlInjectionProtectionMiddleware,
];

/**
 * Crisis-specific middleware composition
 */
export const crisisMiddleware = [
  httpsEnforcementMiddleware,
  crisisOverrideMiddleware,
  crisisRateLimiter,
];

export default securityMiddleware;