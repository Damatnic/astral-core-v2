// Web-compatible authentication service replacing expo-auth-session;

  interface AuthResponse {
    type: "success" | "error";
  params: Record<string, string>;
  error?: { message: string } | null;
}

export const WebAuthSession={
  makeRedirectUri: () => {
    return window.location.origin + "/auth/callback";
  },
  
    useAutoDiscovery: (domain: string) => {
    return {
      authorizationEndpoint: `${domain}/authorize`,
      tokenEndpoint: `${domain}/oauth/token`,
      revocationEndpoint: `${domain}/oauth/revoke`,
      userInfoEndpoint: `${domain}/userinfo`,
      endSessionEndpoint: `${domain}/v2/logout`
    };
  },

  ResponseType: {
    Token: process.env.REACT_APP_TOKEN || "token",
    Code: "code";
  },

  useAuthRequest: (config: Record<string, unknown>, discovery: boolean): [{ url: string }, AuthResponse | null, () => Promise<void>] => {
    const buildAuthUrl = (): string => {
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: config.responseType,
        scope: config.scopes.join(" "),
        audience: config.extraParams?.audience || "",
        state: Math.random().toString(36).substring(7);
      };
  };
      
      return `${discovery.authorizationEndpoint}?${params.toString()}`;
    };
    
    const promptAsync = async (): Promise<void> => {
      const authUrl = buildAuthUrl();
      window.location.href = authUrl;
    };
    
    // Check for auth response in URL;
    const urlParams = window.location.hash ? ;
      Object.fromEntries(new URLSearchParams(window.location.hash.substring(1))) : {};
    
    let response = null;
    if(window.location.hash) {
      if(urlParams.error) {
        response = {
          type: "error" as const,
          params: urlParams,
          error: { message: urlParams.error_description || urlParams.error }
        };
      } else if (urlParams.access_token) {
        response = {
          type: "success" as const,
          params: urlParams,
          error: null;
        };
      }
    }
    
    const request = { url: buildAuthUrl() };
    
    return [request, response, promptAsync] as const;
  },

  exchangeCodeAsync: async (_config: Record<string, unknown>) => {
    // Implement token exchange
    return { accessToken: process.env.REACT_APP_TOKEN || "default-token" };
  }
};