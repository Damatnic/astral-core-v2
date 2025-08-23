// Simple AI Chat handler for Netlify Functions
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
    const path = event.path.replace('/.netlify/functions/chat-ai/', '');
    const method = event.httpMethod;

    // Handle AI chat message
    if (method === 'POST' && path === 'message') {
      const body = JSON.parse(event.body || '{}');
      
      // Simple AI response (in production, integrate with OpenAI)
      const aiResponse = generateSimpleResponse(body.message);
      
      // Log conversation (in production, save to database)
      console.log('Chat message:', {
        userId: body.userId,
        conversationId: body.conversationId,
        message: body.message,
        aiResponse,
        timestamp: new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            message: aiResponse,
            messageId: generateId(),
            responseTime: 100,
            crisisDetected: false
          }
        })
      };
    }

    // Get conversation history
    if (method === 'GET' && path.startsWith('conversation/')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            messages: [],
            conversationId: path.split('/')[1],
            count: 0
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
    console.error('Chat AI function error:', error);
    
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
function generateSimpleResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Crisis detection
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end it all')) {
    return "I'm very concerned about what you've shared. Please know that you're not alone, and there are people who want to help. The 988 Suicide & Crisis Lifeline is available 24/7 at 988. Would you like me to help you connect with immediate support?";
  }
  
  // Supportive responses
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('anxious')) {
    return "I hear that you're going through a difficult time. Your feelings are valid, and it's okay to not be okay. Would you like to talk about what's been most challenging for you lately?";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
    return "I'm here to support you. There are many resources available, including crisis support (988), peer support, and professional counseling. What kind of support would be most helpful for you right now?";
  }
  
  // Default therapeutic response
  return "Thank you for sharing that with me. I'm here to listen and support you. How are you feeling right now, and what would be most helpful to explore together?";
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
