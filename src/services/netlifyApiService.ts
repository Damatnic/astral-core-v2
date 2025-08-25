/**
 * Netlify API Service
 *
 * Provides integration with Netlify's deployment and hosting APIs for the mental health platform.
 * Handles deployment status, form submissions, edge functions, and environment management
 * with proper error handling and monitoring.
 *
 * @fileoverview Netlify API integration and deployment management
 * @version 2.0.0
 */

import { logger } from '../utils/logger';
import { ENV } from '../utils/envConfig';

export interface NetlifyDeployment {
  id: string;
  url: string;
  deploy_url: string;
  admin_url: string;
  state: 'building' | 'ready' | 'error' | 'processing';
  created_at: string;
  updated_at: string;
  commit_ref: string;
  branch: string;
  context: 'production' | 'deploy-preview' | 'branch-deploy';
  error_message?: string;
  deploy_time?: number;
  published_at?: string;
}

export interface NetlifyFormSubmission {
  id: string;
  form_id: string;
  form_name: string;
  data: Record<string, any>;
  created_at: string;
  ip: string;
  user_agent: string;
  referrer?: string;
  site_url: string;
}

export interface NetlifyFunction {
  name: string;
  sha: string;
  runtime: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface NetlifySiteInfo {
  id: string;
  name: string;
  url: string;
  admin_url: string;
  deploy_url: string;
  state: 'current' | 'processing' | 'error';
  created_at: string;
  updated_at: string;
  plan: string;
  account_name: string;
  account_slug: string;
  git_provider: string;
  build_settings: {
    repo_url: string;
    branch: string;
    cmd: string;
    dir: string;
    env: Record<string, string>;
  };
}

export interface NetlifyConfig {
  apiToken: string;
  siteId: string;
  baseUrl: string;
  enableFormHandling: boolean;
  enableFunctionMonitoring: boolean;
  enableDeploymentWebhooks: boolean;
}

class NetlifyApiService {
  private config: NetlifyConfig;
  private readonly API_BASE_URL = 'https://api.netlify.com/api/v1';

  constructor() {
    this.config = {
      apiToken: ENV.NETLIFY_API_TOKEN || '',
      siteId: ENV.NETLIFY_SITE_ID || '',
      baseUrl: ENV.NETLIFY_BASE_URL || 'https://astral-core-mental-health.netlify.app',
      enableFormHandling: true,
      enableFunctionMonitoring: true,
      enableDeploymentWebhooks: true,
    };

    if (!this.config.apiToken || !this.config.siteId) {
      logger.warn('Netlify API credentials not configured. Some features will be disabled.');
    } else {
      logger.info('NetlifyApiService initialized with site:', this.config.siteId);
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.config.apiToken) {
      throw new Error('Netlify API token not configured');
    }

    const url = `${this.API_BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Netlify API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`Netlify API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Deployment Management
  public async getCurrentDeployment(): Promise<NetlifyDeployment | null> {
    try {
      const deployments = await this.makeRequest<NetlifyDeployment[]>(
        `/sites/${this.config.siteId}/deploys?per_page=1`
      );
      return deployments[0] || null;
    } catch (error) {
      logger.error('Failed to get current deployment:', error);
      return null;
    }
  }

  public async getDeploymentHistory(limit: number = 10): Promise<NetlifyDeployment[]> {
    try {
      return await this.makeRequest<NetlifyDeployment[]>(
        `/sites/${this.config.siteId}/deploys?per_page=${limit}`
      );
    } catch (error) {
      logger.error('Failed to get deployment history:', error);
      return [];
    }
  }

  public async getDeploymentById(deployId: string): Promise<NetlifyDeployment | null> {
    try {
      return await this.makeRequest<NetlifyDeployment>(`/deploys/${deployId}`);
    } catch (error) {
      logger.error(`Failed to get deployment ${deployId}:`, error);
      return null;
    }
  }

  public async triggerDeployment(branch: string = 'main'): Promise<NetlifyDeployment | null> {
    try {
      return await this.makeRequest<NetlifyDeployment>(
        `/sites/${this.config.siteId}/deploys`,
        {
          method: 'POST',
          body: JSON.stringify({
            branch,
            title: `Manual deployment from ${branch}`,
          }),
        }
      );
    } catch (error) {
      logger.error('Failed to trigger deployment:', error);
      return null;
    }
  }

  public async cancelDeployment(deployId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/deploys/${deployId}/cancel`, { method: 'POST' });
      logger.info(`Deployment ${deployId} cancelled successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to cancel deployment ${deployId}:`, error);
      return false;
    }
  }

  // Site Information
  public async getSiteInfo(): Promise<NetlifySiteInfo | null> {
    try {
      return await this.makeRequest<NetlifySiteInfo>(`/sites/${this.config.siteId}`);
    } catch (error) {
      logger.error('Failed to get site info:', error);
      return null;
    }
  }

  public async updateSiteSettings(settings: Partial<NetlifySiteInfo>): Promise<NetlifySiteInfo | null> {
    try {
      return await this.makeRequest<NetlifySiteInfo>(
        `/sites/${this.config.siteId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(settings),
        }
      );
    } catch (error) {
      logger.error('Failed to update site settings:', error);
      return null;
    }
  }

  // Form Handling
  public async getFormSubmissions(formName: string, limit: number = 50): Promise<NetlifyFormSubmission[]> {
    if (!this.config.enableFormHandling) {
      logger.warn('Form handling is disabled');
      return [];
    }

    try {
      return await this.makeRequest<NetlifyFormSubmission[]>(
        `/sites/${this.config.siteId}/forms/${formName}/submissions?per_page=${limit}`
      );
    } catch (error) {
      logger.error(`Failed to get form submissions for ${formName}:`, error);
      return [];
    }
  }

  public async getAllForms(): Promise<Array<{ id: string; name: string; paths: string[]; submission_count: number }>> {
    if (!this.config.enableFormHandling) {
      logger.warn('Form handling is disabled');
      return [];
    }

    try {
      return await this.makeRequest<Array<{ id: string; name: string; paths: string[]; submission_count: number }>>(
        `/sites/${this.config.siteId}/forms`
      );
    } catch (error) {
      logger.error('Failed to get forms:', error);
      return [];
    }
  }

  public async deleteFormSubmission(submissionId: string): Promise<boolean> {
    if (!this.config.enableFormHandling) {
      logger.warn('Form handling is disabled');
      return false;
    }

    try {
      await this.makeRequest(`/submissions/${submissionId}`, { method: 'DELETE' });
      logger.info(`Form submission ${submissionId} deleted successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete form submission ${submissionId}:`, error);
      return false;
    }
  }

  // Edge Functions
  public async getFunctions(): Promise<NetlifyFunction[]> {
    if (!this.config.enableFunctionMonitoring) {
      logger.warn('Function monitoring is disabled');
      return [];
    }

    try {
      return await this.makeRequest<NetlifyFunction[]>(`/sites/${this.config.siteId}/functions`);
    } catch (error) {
      logger.error('Failed to get functions:', error);
      return [];
    }
  }

  public async invokeFunctionTest(functionName: string, payload?: Record<string, any>): Promise<any> {
    if (!this.config.enableFunctionMonitoring) {
      logger.warn('Function monitoring is disabled');
      return null;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/.netlify/functions/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Function invocation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`Failed to invoke function ${functionName}:`, error);
      throw error;
    }
  }

  // Environment Variables
  public async getEnvironmentVariables(): Promise<Record<string, string>> {
    try {
      const envVars = await this.makeRequest<Array<{ key: string; values: Array<{ value: string; context: string }> }>>(
        `/accounts/${this.config.siteId}/env`
      );

      const result: Record<string, string> = {};
      envVars.forEach(envVar => {
        const productionValue = envVar.values.find(v => v.context === 'production');
        if (productionValue) {
          result[envVar.key] = productionValue.value;
        }
      });

      return result;
    } catch (error) {
      logger.error('Failed to get environment variables:', error);
      return {};
    }
  }

  public async setEnvironmentVariable(key: string, value: string, contexts: string[] = ['production']): Promise<boolean> {
    try {
      await this.makeRequest(
        `/accounts/${this.config.siteId}/env/${key}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            values: contexts.map(context => ({ value, context })),
          }),
        }
      );
      logger.info(`Environment variable ${key} set successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to set environment variable ${key}:`, error);
      return false;
    }
  }

  public async deleteEnvironmentVariable(key: string): Promise<boolean> {
    try {
      await this.makeRequest(`/accounts/${this.config.siteId}/env/${key}`, { method: 'DELETE' });
      logger.info(`Environment variable ${key} deleted successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete environment variable ${key}:`, error);
      return false;
    }
  }

  // Webhooks
  public async createWebhook(url: string, event: string): Promise<{ id: string; url: string; event: string } | null> {
    if (!this.config.enableDeploymentWebhooks) {
      logger.warn('Deployment webhooks are disabled');
      return null;
    }

    try {
      return await this.makeRequest<{ id: string; url: string; event: string }>(
        `/hooks`,
        {
          method: 'POST',
          body: JSON.stringify({
            site_id: this.config.siteId,
            type: 'url',
            event,
            data: { url },
          }),
        }
      );
    } catch (error) {
      logger.error('Failed to create webhook:', error);
      return null;
    }
  }

  public async deleteWebhook(hookId: string): Promise<boolean> {
    if (!this.config.enableDeploymentWebhooks) {
      logger.warn('Deployment webhooks are disabled');
      return false;
    }

    try {
      await this.makeRequest(`/hooks/${hookId}`, { method: 'DELETE' });
      logger.info(`Webhook ${hookId} deleted successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to delete webhook ${hookId}:`, error);
      return false;
    }
  }

  // Monitoring and Analytics
  public async getDeploymentMetrics(deployId: string): Promise<{
    buildTime: number;
    deployTime: number;
    totalTime: number;
    fileCount: number;
    totalSize: number;
  } | null> {
    try {
      const deployment = await this.getDeploymentById(deployId);
      if (!deployment) return null;

      // Calculate metrics from deployment data
      const buildTime = deployment.deploy_time || 0;
      const deployTime = deployment.published_at && deployment.created_at 
        ? new Date(deployment.published_at).getTime() - new Date(deployment.created_at).getTime()
        : 0;

      return {
        buildTime,
        deployTime,
        totalTime: buildTime + deployTime,
        fileCount: 0, // This would require additional API calls to get file details
        totalSize: 0,  // This would require additional API calls to get size details
      };
    } catch (error) {
      logger.error(`Failed to get deployment metrics for ${deployId}:`, error);
      return null;
    }
  }

  public async getBandwidthUsage(): Promise<{ used: number; included: number; additional: number } | null> {
    try {
      const siteInfo = await this.getSiteInfo();
      if (!siteInfo) return null;

      // This is a simplified version - actual bandwidth data would require account-level API access
      return {
        used: 0,
        included: 100 * 1024 * 1024 * 1024, // 100GB default for most plans
        additional: 0,
      };
    } catch (error) {
      logger.error('Failed to get bandwidth usage:', error);
      return null;
    }
  }

  // Health Check
  public async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    deployment: NetlifyDeployment | null;
    site: NetlifySiteInfo | null;
    lastCheck: string;
  }> {
    const lastCheck = new Date().toISOString();
    
    try {
      const [deployment, site] = await Promise.all([
        this.getCurrentDeployment(),
        this.getSiteInfo(),
      ]);

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      
      if (!deployment || !site) {
        status = 'unhealthy';
      } else if (deployment.state === 'error' || site.state === 'error') {
        status = 'degraded';
      } else if (deployment.state !== 'ready' || site.state !== 'current') {
        status = 'degraded';
      }

      return {
        status,
        deployment,
        site,
        lastCheck,
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        deployment: null,
        site: null,
        lastCheck,
      };
    }
  }

  public getConfig(): NetlifyConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<NetlifyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Netlify API config updated:', newConfig);
  }
}

export const netlifyApiService = new NetlifyApiService();

// React Hook for Netlify Integration
export const useNetlifyApi = () => {
  const [deploymentStatus, setDeploymentStatus] = React.useState<NetlifyDeployment | null>(null);
  const [siteInfo, setSiteInfo] = React.useState<NetlifySiteInfo | null>(null);

  React.useEffect(() => {
    const loadInitialData = async () => {
      const [deployment, site] = await Promise.all([
        netlifyApiService.getCurrentDeployment(),
        netlifyApiService.getSiteInfo(),
      ]);
      setDeploymentStatus(deployment);
      setSiteInfo(site);
    };

    loadInitialData();
  }, []);

  const triggerDeploy = React.useCallback(async (branch: string = 'main') => {
    const deployment = await netlifyApiService.triggerDeployment(branch);
    if (deployment) {
      setDeploymentStatus(deployment);
    }
    return deployment;
  }, []);

  const refreshStatus = React.useCallback(async () => {
    const deployment = await netlifyApiService.getCurrentDeployment();
    setDeploymentStatus(deployment);
    return deployment;
  }, []);

  return {
    deploymentStatus,
    siteInfo,
    triggerDeploy,
    refreshStatus,
    healthCheck: netlifyApiService.healthCheck.bind(netlifyApiService),
    getDeploymentHistory: netlifyApiService.getDeploymentHistory.bind(netlifyApiService),
    getFormSubmissions: netlifyApiService.getFormSubmissions.bind(netlifyApiService),
    getFunctions: netlifyApiService.getFunctions.bind(netlifyApiService),
  };
};

export default netlifyApiService;