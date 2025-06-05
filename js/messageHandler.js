// Message handling and UI updates
class MessageHandler {
  constructor() {
    this.messageContainer = document.getElementById('chat-messages');
    this.typingIndicator = document.getElementById('typing-indicator');
    this.personalitySelect = document.getElementById('personality-select');
    this.ttsToggle = document.getElementById('tts-toggle');
  }
  
  getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes}`;
  }
  
  addUserMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${text}</p>
      </div>
      <div class="message-timestamp">
        <span>${this.getCurrentTime()}</span>
      </div>
    `;
    
    this.messageContainer.appendChild(messageDiv);
    this.scrollToBottom();
    animationController.slideIn(messageDiv, 'right');
  }
  
  addAIMessage(text, isImage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai-message';
    
    const content = isImage ? 
      `<img src="${text}" alt="Generated Image" class="generated-image">` :
      `<p></p>`;
    
    messageDiv.innerHTML = `
      <div class="message-content">
        ${content}
      </div>
      <div class="message-timestamp">
        <span>${this.getCurrentTime()}</span>
      </div>
    `;
    
    this.messageContainer.appendChild(messageDiv);
    this.scrollToBottom();
    
    if (!isImage) {
      const messageParagraph = messageDiv.querySelector('p');
      animationController.typewriterEffect(messageParagraph, text, () => {
        this.scrollToBottom();
        
        // Play TTS if enabled
        if (this.ttsToggle.checked && text) {
          this.playTTSAudio(text);
        }
      });
    }
    
    animationController.slideIn(messageDiv, 'left');
  }
  
  async playTTSAudio(text) {
    try {
      const response = await chatService.sendMessage(text, this.personalitySelect.value, true);
      if (response.tts_path) {
        const audio = new Audio(`${chatService.baseUrl}/${response.tts_path}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Error playing TTS:', error);
    }
  }
  
  scrollToBottom() {
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }
}

// Create global message handler
const messageHandler = new MessageHandler();