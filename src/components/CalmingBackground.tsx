import React, { useEffect, useRef } from 'react';
import './CalmingBackground.css';

interface CalmingBackgroundProps {
  theme?: 'ocean' | 'forest' | 'sky' | 'aurora';
  intensity?: number;
}

export const CalmingBackground: React.FC<CalmingBackgroundProps> = ({ 
  theme = 'ocean',
  intensity = 0.5 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Animation variables
    let animationId: number;
    let time = 0;
    
    // Particle system for floating elements
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.hue = theme === 'ocean' ? 200 : theme === 'forest' ? 120 : theme === 'sky' ? 210 : 280;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap around edges
        const width = canvas?.width || window.innerWidth;
        const height = canvas?.height || window.innerHeight;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        
        // Gentle floating motion
        this.y += Math.sin(time * 0.001 + this.x * 0.01) * 0.2;
      }
      
      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity * intensity;
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        gradient.addColorStop(0, `hsla(${this.hue}, 70%, 60%, ${this.opacity * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Create particles
    const particles: Particle[] = [];
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Wave animation for ocean/sky themes
    const drawWaves = () => {
      if (theme !== 'ocean' && theme !== 'sky') return;
      
      ctx.save();
      ctx.globalAlpha = 0.1 * intensity;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = theme === 'ocean' 
          ? `hsla(200, 70%, 50%, ${0.2 - i * 0.05})`
          : `hsla(210, 60%, 70%, ${0.2 - i * 0.05})`;
        ctx.lineWidth = 2;
        
        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 + 
            Math.sin((x * 0.01) + (time * 0.001) + (i * 2)) * 50 * (i + 1) +
            Math.sin((x * 0.02) + (time * 0.002)) * 20;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    };
    
    // Aurora effect for aurora theme
    const drawAurora = () => {
      if (theme !== 'aurora') return;
      
      ctx.save();
      ctx.globalAlpha = 0.15 * intensity;
      
      for (let i = 0; i < 5; i++) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        const hueShift = time * 0.01 + i * 60;
        gradient.addColorStop(0, `hsla(${120 + hueShift % 360}, 70%, 50%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${280 + hueShift % 360}, 70%, 50%, 0.3)`);
        gradient.addColorStop(1, `hsla(${200 + hueShift % 360}, 70%, 50%, 0.3)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        for (let x = 0; x <= canvas.width; x += 10) {
          const y = canvas.height * 0.3 + 
            Math.sin((x * 0.005) + (time * 0.002) + i) * 100 +
            Math.sin((x * 0.01) + (time * 0.001) + i * 2) * 50;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };
    
    // Animation loop
    const animate = () => {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw theme-specific background
      drawWaves();
      drawAurora();
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      time++;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [theme, intensity]);
  
  return (
    <div className="calming-background-container">
      <canvas 
        ref={canvasRef} 
        className="calming-canvas"
        aria-hidden="true"
      />
      <div className={`background-overlay theme-${theme}`} />
    </div>
  );
};