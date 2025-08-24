const API_BASE_URL = 'http://localhost:3003';

export async function fetchEmails() {
  const response = await fetch(`${API_BASE_URL}/api/emails`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  
  return response.json();
}

export async function fetchEmail(id) {
  const response = await fetch(`${API_BASE_URL}/api/emails/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch email');
  }
  
  return response.json();
}

export async function createEmail(emailData) {
  const response = await fetch(`${API_BASE_URL}/api/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create email');
  }
  
  return response.json();
}

export async function routeAiPrompt(prompt) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/route`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors', // Explicitly request CORS mode
      credentials: 'same-origin',
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to route AI prompt: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in routeAiPrompt:', error);
    throw error;
  }
}

export async function generateEmailWithAi(prompt, assistantType) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors', // Explicitly request CORS mode
      credentials: 'same-origin',
      body: JSON.stringify({ prompt, assistantType }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Failed to generate email with AI: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in generateEmailWithAi:', error);
    throw error;
  }
}
