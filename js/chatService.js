// Chat service for API communication
class ChatService {
  constructor() {
    this.baseUrl = 'http://localhost:8000';
  }
  
  /**
   * Send a message to the chat API
   * @param {string} message - User message
   * @param {string} personality - Selected personality
   * @param {boolean} tts - Enable text-to-speech
   * @returns {Promise} API response
   */
  async sendMessage(message, personality = 'default', tts = false) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: message,
          personality: personality,
          tts: tts 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error communicating with the API:', error);
      throw error;
    }
  }

  /**
   * Generate an image from text description
   * @param {string} description - Image description
   * @returns {Promise} API response with image path
   */
  async generateImage(description) {
    try {
      const response = await fetch(`${this.baseUrl}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Stream chat response
   * @param {string} message - User message
   * @param {string} personality - Selected personality
   * @returns {ReadableStream} Stream of tokens
   */
  async streamChat(message, personality = 'default') {
    try {
      const response = await fetch(`${this.baseUrl}/stream-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          prompt: message,
          personality: personality 
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Error streaming chat:', error);
      throw error;
    }
  }
}

// Create global chat service
const chatService = new ChatService();