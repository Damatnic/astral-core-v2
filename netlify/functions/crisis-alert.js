// Simple Crisis Alert handler for Netlify Functions
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
    const path = event.path.replace('/.netlify/functions/crisis-alert/', '');
    const method = event.httpMethod;

    // Create crisis alert
    if (method === 'POST' && path === 'create') {
      const body = JSON.parse(event.body || '{}');
      
      // Log crisis event (in production, save to database)
      const crisisEvent = {
        id: generateId(),
        userId: body.userId,
        severity: body.severity || 'medium',
        triggerType: body.triggerType || 'manual',
        timestamp: new Date().toISOString(),
        resolved: false
      };
      
      console.log('Crisis alert created:', crisisEvent);
      
      // Generate recommendations based on severity
      const recommendations = getCrisisRecommendations(body.severity || 'medium');

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            crisisEventId: crisisEvent.id,
            severity: crisisEvent.severity,
            autoEscalated: ['critical', 'high'].includes(crisisEvent.severity)
          },
          recommendations
        })
      };
    }

    // Get active crisis events
    if (method === 'GET' && path === 'active') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            events: [], // In production, fetch from database
            count: 0
          }
        })
      };
    }

    // Resolve crisis event
    if (method === 'POST' && path === 'resolve') {
      const body = JSON.parse(event.body || '{}');
      
      console.log('Crisis resolved:', {
        crisisEventId: body.crisisEventId,
        resolutionMethod: body.resolutionMethod,
        timestamp: new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            crisisEventId: body.crisisEventId,
            resolvedAt: new Date().toISOString(),
            resolutionMethod: body.resolutionMethod
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
    console.error('Crisis alert function error:', error);
    
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

// Helper functions
function getCrisisRecommendations(severity) {
  const recommendations = {
    low: [
      'Practice deep breathing exercises',
      'Use grounding techniques (5-4-3-2-1 method)',
      'Reach out to a trusted friend',
      'Take a brief walk if possible'
    ],
    medium: [
      'Access your safety plan',
      'Use breathing exercises',
      'Contact a support person',
      'Consider professional crisis resources',
      'Practice mindfulness techniques'
    ],
    high: [
      'Implement your crisis safety plan immediately',
      'Contact emergency support person',
      'Consider calling crisis hotline (988)',
      'Use immediate grounding techniques',
      'Ensure you are in a safe environment'
    ],
    critical: [
      'Call 988 (Suicide & Crisis Lifeline) immediately',
      'Contact emergency services if in immediate danger',
      'Reach out to emergency contact person',
      'Go to emergency room if needed',
      'Remove access to means of self-harm'
    ]
  };

  return recommendations[severity] || recommendations.medium;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
