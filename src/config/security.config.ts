/**
 * Comprehensive Security Configuration for CoreV2 Mental Health Platform
 * HIPAA Compliant | Zero-Trust Architecture | Mental Health Focused
 */

export interface HIPAASecurityConfig {
  // HIPAA Minimum Necessary Rule
  dataMinimization: {
    enabled: boolean;
    logDataAccess: boolean;
    autoRedactSensitiveFields: string[];
    retentionPeriod: number; // in days
  };
  
  // HIPAA Administrative Safeguards
  administrativeSafeguards: {
    securityOfficerRequired: boolean;
    workforceTrainingRequired: boolean;
    accessManagementProcedures: boolean;
    informationSystemReview: number; // days between reviews
  };

  // HIPAA Physical Safeguards
  physicalSafeguards: {
    facilityAccessControls: boolean;
    workstationUseRestrictions: boolean;
    deviceMediaControls: boolean;
  };

  // HIPAA Technical Safeguards
  technicalSafeguards: {
    accessControl: boolean;
    auditControls: boolean;
    integrity: boolean;
    transmission: boolean;
  };
}

export interface CrisisSecurityConfig {
  emergencyOverrides: {
    enabled: boolean;
    bypassRateLimiting: boolean;
    elevatedLogging: boolean;
    instantAlerts: boolean;
  };
  
  interventionSecurity: {
    requireTwoFactorForHelpers: boolean;
    encryptCrisisNotes: boolean;
    anonymizeAfterResolution: number; // hours
    auditAllAccess: boolean;
  };
}

export interface ZeroTrustConfig {
  verifyExplicitly: {
    enabled: boolean;
    requireDeviceFingerprinting: boolean;
    continuousValidation: boolean;
    riskBasedAccess: boolean;
  };
  
  leastPrivilegeAccess: {
    enabled: boolean;
    timeBasedAccess: boolean;
    conditionalAccess: boolean;
    privilegeEscalationLogging: boolean;
  };
  
  assumeBreach: {
    enabled: boolean;
    networkSegmentation: boolean;
    encryptEverything: boolean;
    minimizeBlastRadius: boolean;
  };
}

export interface EncryptionConfig {
  atRest: {
    algorithm: string;
    keySize: number;
    keyRotationDays: number;
    backupEncryption: boolean;
  };
  
  inTransit: {
    enforceHTTPS: boolean;
    tlsVersion: string;
    certificatePinning: boolean;
    hsts: boolean;
  };
  
  endToEnd: {
    enabled: boolean;
    keyExchangeAlgorithm: string;
    messageEncryption: string;
    fileEncryption: boolean;
  };
}

export interface CSPConfig {
  directives: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
    frameAncestors: string[];
    formAction: string[];
    baseUri: string[];
    upgradeInsecureRequests: boolean;
    reportUri?: string;
    reportTo?: string;
  };
  
  reportOnly: boolean;
  nonce: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: string;
  onLimitReached?: string;
  store?: string;
}

export interface SecurityHeadersConfig {
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  
  xFrameOptions: {
    enabled: boolean;
    value: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
    allowFrom?: string;
  };
  
  xContentTypeOptions: {
    enabled: boolean;
    nosniff: boolean;
  };
  
  referrerPolicy: {
    enabled: boolean;
    policy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  };
  
  permissionsPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
  };
}

export interface SessionConfig {
  jwt: {
    secret: string;
    algorithm: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
    expiresIn: string;
    refreshTokenExpiresIn: string;
    issuer: string;
    audience: string;
  };
  
  session: {
    name: string;
    secret: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
    rolling: boolean;
  };
  
  security: {
    requireTwoFactor: boolean;
    deviceRemembering: boolean;
    concurrentSessionLimit: number;
    sessionTimeout: number;
  };
}

export interface APISecurityConfig {
  authentication: {
    required: boolean;
    methods: string[];
    tokenValidation: boolean;
    apiKeyRequired: boolean;
  };
  
  authorization: {
    rbac: boolean;
    abac: boolean;
    resourceBasedAccess: boolean;
  };
  
  validation: {
    inputSanitization: boolean;
    outputEncoding: boolean;
    sqlInjectionProtection: boolean;
    xssProtection: boolean;
  };
  
  logging: {
    requestLogging: boolean;
    errorLogging: boolean;
    securityEventLogging: boolean;
    performanceLogging: boolean;
  };
}

export interface SecurityConfig {
  // Environment
  environment: 'development' | 'staging' | 'production';
  
  // HIPAA Compliance
  hipaa: HIPAASecurityConfig;
  
  // Crisis-specific Security
  crisis: CrisisSecurityConfig;
  
  // Zero Trust Architecture
  zeroTrust: ZeroTrustConfig;
  
  // Encryption Settings
  encryption: EncryptionConfig;
  
  // Content Security Policy
  csp: CSPConfig;
  
  // Rate Limiting
  rateLimiting: {
    global: RateLimitConfig;
    api: RateLimitConfig;
    auth: RateLimitConfig;
    crisis: RateLimitConfig;
    chat: RateLimitConfig;
    upload: RateLimitConfig;
  };
  
  // CORS Configuration
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    credentials: boolean;
    preflightContinue: boolean;
    optionsSuccessStatus: number;
    maxAge: number;
  };
  
  // Security Headers
  securityHeaders: SecurityHeadersConfig;
  
  // Session Management
  session: SessionConfig;
  
  // API Security
  apiSecurity: APISecurityConfig;
  
  // Audit & Compliance
  audit: {
    enabled: boolean;
    logAllRequests: boolean;
    logAuthEvents: boolean;
    logDataAccess: boolean;
    retentionDays: number;
    complianceReporting: boolean;
  };
  
  // Privacy Settings
  privacy: {
    dataMinimization: boolean;
    rightToForgetting: boolean;
    consentManagement: boolean;
    anonymization: boolean;
    pseudonymization: boolean;
  };
  
  // Threat Detection
  threatDetection: {
    enabled: boolean;
    sqlInjection: boolean;
    xssDetection: boolean;
    bruteForceProtection: boolean;
    anomalyDetection: boolean;
    geoBlocking: string[];
  };
}

// Default Security Configuration
export const defaultSecurityConfig: SecurityConfig = {
  environment: 'production',
  
  hipaa: {
    dataMinimization: {
      enabled: true,
      logDataAccess: true,
      autoRedactSensitiveFields: ['ssn', 'dob', 'phone', 'address', 'emergency_contact'],
      retentionPeriod: 2555, // 7 years as required by HIPAA
    },
    
    administrativeSafeguards: {
      securityOfficerRequired: true,
      workforceTrainingRequired: true,
      accessManagementProcedures: true,
      informationSystemReview: 90,
    },
    
    physicalSafeguards: {
      facilityAccessControls: true,
      workstationUseRestrictions: true,
      deviceMediaControls: true,
    },
    
    technicalSafeguards: {
      accessControl: true,
      auditControls: true,
      integrity: true,
      transmission: true,
    },
  },
  
  crisis: {
    emergencyOverrides: {
      enabled: true,
      bypassRateLimiting: true,
      elevatedLogging: true,
      instantAlerts: true,
    },
    
    interventionSecurity: {
      requireTwoFactorForHelpers: true,
      encryptCrisisNotes: true,
      anonymizeAfterResolution: 72, // 72 hours
      auditAllAccess: true,
    },
  },
  
  zeroTrust: {
    verifyExplicitly: {
      enabled: true,
      requireDeviceFingerprinting: true,
      continuousValidation: true,
      riskBasedAccess: true,
    },
    
    leastPrivilegeAccess: {
      enabled: true,
      timeBasedAccess: true,
      conditionalAccess: true,
      privilegeEscalationLogging: true,
    },
    
    assumeBreach: {
      enabled: true,
      networkSegmentation: true,
      encryptEverything: true,
      minimizeBlastRadius: true,
    },
  },
  
  encryption: {
    atRest: {
      algorithm: 'AES-256-GCM',
      keySize: 256,
      keyRotationDays: 90,
      backupEncryption: true,
    },
    
    inTransit: {
      enforceHTTPS: true,
      tlsVersion: '1.3',
      certificatePinning: true,
      hsts: true,
    },
    
    endToEnd: {
      enabled: true,
      keyExchangeAlgorithm: 'ECDH-P256',
      messageEncryption: 'AES-256-GCM',
      fileEncryption: true,
    },
  },
  
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", // Only for development - remove in production
        'https://esm.sh',
        'https://cdn.jsdelivr.net',
        "'nonce-{nonce}'"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https:', 'wss:', 'https://api.crisis-support.gov'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", 'https:', 'blob:'],
      frameSrc: ["'self'", 'https://secure-video-chat.mental-health.gov'],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: true,
      reportUri: '/csp-report',
    },
    
    reportOnly: false,
    nonce: true,
  },
  
  rateLimiting: {
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
    },
    
    api: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
    },
    
    auth: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5, // Strict for authentication
    },
    
    crisis: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 100, // Higher limit for crisis situations
    },
    
    chat: {
      windowMs: 1 * 60 * 1000,
      maxRequests: 60, // 1 message per second
    },
    
    upload: {
      windowMs: 15 * 60 * 1000,
      maxRequests: 10,
    },
  },
  
  cors: {
    enabled: true,
    origins: process.env.NODE_ENV === 'production' 
      ? ['https://corev2-mental-health.app', 'https://api.corev2-mental-health.app']
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin', 
      'X-Requested-With', 
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'X-CSRF-Token',
      'X-Device-Fingerprint',
      'X-Crisis-Override'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400, // 24 hours
  },
  
  securityHeaders: {
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    
    xFrameOptions: {
      enabled: true,
      value: 'DENY',
    },
    
    xContentTypeOptions: {
      enabled: true,
      nosniff: true,
    },
    
    referrerPolicy: {
      enabled: true,
      policy: 'strict-origin-when-cross-origin',
    },
    
    permissionsPolicy: {
      enabled: true,
      directives: {
        camera: ["'self'"],
        microphone: ["'self'"],
        geolocation: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
        magnetometer: ["'none'"],
        gyroscope: ["'none'"],
      },
    },
  },
  
  session: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-change-this',
      algorithm: 'HS256',
      expiresIn: '15m',
      refreshTokenExpiresIn: '7d',
      issuer: 'corev2-mental-health',
      audience: 'corev2-users',
    },
    
    session: {
      name: 'corev2.sid',
      secret: process.env.SESSION_SECRET || 'your-super-secure-session-secret-change-this',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      rolling: true,
    },
    
    security: {
      requireTwoFactor: true,
      deviceRemembering: true,
      concurrentSessionLimit: 3,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
    },
  },
  
  apiSecurity: {
    authentication: {
      required: true,
      methods: ['jwt', 'session'],
      tokenValidation: true,
      apiKeyRequired: false,
    },
    
    authorization: {
      rbac: true,
      abac: true,
      resourceBasedAccess: true,
    },
    
    validation: {
      inputSanitization: true,
      outputEncoding: true,
      sqlInjectionProtection: true,
      xssProtection: true,
    },
    
    logging: {
      requestLogging: true,
      errorLogging: true,
      securityEventLogging: true,
      performanceLogging: true,
    },
  },
  
  audit: {
    enabled: true,
    logAllRequests: true,
    logAuthEvents: true,
    logDataAccess: true,
    retentionDays: 2555, // 7 years for HIPAA compliance
    complianceReporting: true,
  },
  
  privacy: {
    dataMinimization: true,
    rightToForgetting: true,
    consentManagement: true,
    anonymization: true,
    pseudonymization: true,
  },
  
  threatDetection: {
    enabled: true,
    sqlInjection: true,
    xssDetection: true,
    bruteForceProtection: true,
    anomalyDetection: true,
    geoBlocking: [], // Add countries as needed
  },
};

// Environment-specific overrides
export const getSecurityConfigForEnvironment = (env: 'development' | 'staging' | 'production'): SecurityConfig => {
  const config = { ...defaultSecurityConfig };
  config.environment = env;
  
  switch (env) {
    case 'development':
      // Relaxed settings for development
      config.csp.directives.scriptSrc.push("'unsafe-eval'");
      config.csp.reportOnly = true;
      config.rateLimiting.global.maxRequests = 10000;
      config.session.session.secure = false;
      config.threatDetection.bruteForceProtection = false;
      break;
      
    case 'staging':
      // Similar to production but with some debugging
      config.audit.logAllRequests = true;
      config.threatDetection.anomalyDetection = true;
      break;
      
    case 'production':
      // Strictest security settings
      config.csp.directives.scriptSrc = config.csp.directives.scriptSrc.filter(src => src !== "'unsafe-inline'");
      config.session.security.requireTwoFactor = true;
      config.encryption.inTransit.certificatePinning = true;
      break;
  }
  
  return config;
};

// Utility functions
export const validateSecurityConfig = (config: SecurityConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate JWT secret
  if (!config.session.jwt.secret || config.session.jwt.secret.includes('change-this')) {
    errors.push('JWT secret must be set and not contain default values');
  }
  
  // Validate session secret
  if (!config.session.session.secret || config.session.session.secret.includes('change-this')) {
    errors.push('Session secret must be set and not contain default values');
  }
  
  // Validate HIPAA settings
  if (config.hipaa.dataMinimization.retentionPeriod < 2555) {
    errors.push('HIPAA requires data retention for at least 7 years (2555 days)');
  }
  
  // Validate encryption
  if (config.encryption.atRest.keySize < 256) {
    errors.push('Encryption key size must be at least 256 bits for HIPAA compliance');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export default defaultSecurityConfig;