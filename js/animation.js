// Animation utilities and effects
class AnimationController {
  constructor() {
    this.typingSpeed = 30; // ms per character
  }
  
  // Typewriter effect for AI messages
  typewriterEffect(element, text, callback) {
    let i = 0;
    element.innerHTML = "";
    
    const typeChar = () => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeChar, this.typingSpeed);
      } else if (callback) {
        callback();
      }
    };
    
    typeChar();
  }
  
  // Fade in animation for message elements
  fadeIn(element, delay = 0) {
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      
      // Force reflow to ensure the initial state is applied
      void element.offsetWidth;
      
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, delay);
  }
  
  // Slide in animation for message elements
  slideIn(element, direction = 'right', delay = 0) {
    const initialX = direction === 'right' ? 50 : -50;
    
    setTimeout(() => {
      element.style.opacity = '0';
      element.style.transform = `translateX(${initialX}px)`;
      
      // Force reflow
      void element.offsetWidth;
      
      element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateX(0)';
    }, delay);
  }
  
  // Add glowing pulse effect to an element
  addPulseEffect(element, color) {
    element.style.animation = `pulse 2s infinite alternate`;
    element.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
  }
  
  // Show typing indicator
  showTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.classList.remove('hidden');
    return typingIndicator;
  }
  
  // Hide typing indicator
  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    typingIndicator.classList.add('hidden');
  }
}

// Create global animation controller
const animationController = new AnimationController();