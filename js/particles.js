// Particle system for background animation
class ParticleSystem {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particleContainer = document.getElementById('particle-container');
    this.particleContainer.appendChild(this.canvas);
    
    this.particles = [];
    this.particleCount = 50;
    this.maxDistance = 150;
    this.colors = ['#00d9ff', '#ff00e1', '#00ffe1'];
    
    this.init();
    this.animate();
    
    // Handle window resize
    window.addEventListener('resize', () => this.resize());
  }
  
  init() {
    this.resize();
    this.createParticles();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Recreate particles on resize
    if (this.particles.length > 0) {
      this.particles = [];
      this.createParticles();
    }
  }
  
  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: this.colors[Math.floor(Math.random() * this.colors.length)]
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw particles
    this.updateParticles();
    this.drawParticles();
    
    // Draw connections between particles
    this.connectParticles();
    
    requestAnimationFrame(() => this.animate());
  }
  
  updateParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      // Move particles
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Bounce off edges
      if (particle.x > this.canvas.width || particle.x < 0) {
        particle.speedX = -particle.speedX;
      }
      
      if (particle.y > this.canvas.height || particle.y < 0) {
        particle.speedY = -particle.speedY;
      }
    }
  }
  
  drawParticles() {
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
      
      // Add glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = particle.color;
    }
  }
  
  connectParticles() {
    for (let a = 0; a < this.particles.length; a++) {
      for (let b = a; b < this.particles.length; b++) {
        const particleA = this.particles[a];
        const particleB = this.particles[b];
        
        const dx = particleA.x - particleB.x;
        const dy = particleA.y - particleB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.maxDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - (distance / this.maxDistance);
          
          // Draw line connecting particles
          this.ctx.beginPath();
          this.ctx.strokeStyle = particleA.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.stroke();
        }
      }
    }
  }
}

// Initialize particle system when page loads
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem();
});