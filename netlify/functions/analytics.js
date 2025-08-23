// Simple analytics handler for Netlify Functions
export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/analytics/', '');
    const method = event.httpMethod;

    // Simple analytics tracking
    if (method === 'POST' && path === 'track') {
      const body = JSON.parse(event.body || '{}');
      
      // Log analytics event (in production, save to database)
      console.log('Analytics event:', {
        event: body.event,
        userId: body.userId,
        properties: body.properties,
        timestamp: new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Event tracked successfully'
        })
      };
    }

    // Get analytics summary
    if (method === 'GET' && path === 'summary') {
      // Return mock analytics data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            totalUsers: 1250,
            activeUsers: 342,
            crisisInterventions: 28,
            wellnessActivities: 1456,
            peerConnections: 89,
            averageSessionTime: 12.5,
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      })
    };

  } catch (error) {
    console.error('Analytics function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    };
  }
};

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/analytics/', '');
    const method = event.httpMethod;

    // Simple analytics tracking
    if (method === 'POST' && path === 'track') {
      const body = JSON.parse(event.body || '{}');
      
      // Log analytics event (in production, save to database)
      console.log('Analytics event:', {
        event: body.event,
        userId: body.userId,
        properties: body.properties,
        timestamp: new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Event tracked successfully'
        })
      };
    }

    // Get analytics summary
    if (method === 'GET' && path === 'summary') {
      // Return mock analytics data
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            totalUsers: 1250,
            activeUsers: 342,
            crisisInterventions: 28,
            wellnessActivities: 1456,
            peerConnections: 89,
            averageSessionTime: 12.5,
            timestamp: new Date().toISOString()
          }
        })
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Endpoint not found'
      })
    };

  } catch (error) {
    console.error('Analytics function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    };
  }
};
