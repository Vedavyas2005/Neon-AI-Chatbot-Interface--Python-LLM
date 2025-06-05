// Main application logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-button');
  const chatMode = document.getElementById('chat-mode');
  const imageMode = document.getElementById('image-mode');
  const personalitySelect = document.getElementById('personality-select');
  const ttsToggle = document.getElementById('tts-toggle');
  
  let currentMode = 'chat';
  
  const handleMessageSubmit = async () => {
    const message = chatInput.value.trim();
    if (!message) return;
    
    messageHandler.addUserMessage(message);
    chatInput.value = '';
    animationController.showTypingIndicator();
    
    try {
      if (currentMode === 'chat') {
        const response = await chatService.sendMessage(
          message,
          personalitySelect.value,
          ttsToggle.checked
        );
        
        if (response && response.response) {
          messageHandler.addAIMessage(response.response);
        }
      } else {
        const response = await chatService.generateImage(message);
        if (response && response.path) {
          messageHandler.addAIMessage(`${chatService.baseUrl}/${response.path}`, true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      messageHandler.addAIMessage("I encountered an error. Please try again.");
    } finally {
      animationController.hideTypingIndicator();
    }
  };
  
  // Mode switching
  chatMode.addEventListener('click', () => {
    currentMode = 'chat';
    chatMode.classList.add('active');
    imageMode.classList.remove('active');
    chatInput.placeholder = 'Type your message here...';
  });
  
  imageMode.addEventListener('click', () => {
    currentMode = 'image';
    imageMode.classList.add('active');
    chatMode.classList.remove('active');
    chatInput.placeholder = 'Describe the image you want to generate...';
  });
  
  // Event listeners
  sendButton.addEventListener('click', handleMessageSubmit);
  
  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      handleMessageSubmit();
    }
  });
  
  // Focus input on load
  chatInput.focus();
  
  // Button hover effects
  sendButton.addEventListener('mouseenter', () => {
    sendButton.style.boxShadow = '0 0 15px var(--primary-neon)';
  });
  
  sendButton.addEventListener('mouseleave', () => {
    sendButton.style.boxShadow = 'none';
  });
  
  // Adjust chat area height
  const adjustChatAreaHeight = () => {
    const header = document.querySelector('.chat-header');
    const inputContainer = document.querySelector('.chat-input-container');
    const chatMessages = document.querySelector('.chat-messages');
    const availableHeight = window.innerHeight - header.offsetHeight - inputContainer.offsetHeight;
    chatMessages.style.height = `${availableHeight}px`;
  };
  
  adjustChatAreaHeight();
  window.addEventListener('resize', adjustChatAreaHeight);
});