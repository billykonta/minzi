"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import Image from "next/image"

// Star types for the dark/midnight themes
type Star = {
  id: number
  size: number
  x: number
  y: number
  type: 'small' | 'medium' | 'large' | 'shooting'
  color: string
}

type ShootingStar = {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function ThemeBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([])
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  // Check which theme is active
  const isDarkTheme = theme === "dark"
  const isMidnightTheme = theme === "midnight"
  const isSunsetTheme = theme === "sunset"
  const isForestTheme = theme === "forest"
  const hasStarryBackground = isDarkTheme || isMidnightTheme

  // Generate stars and shooting stars for dark/midnight themes
  useEffect(() => {
    setMounted(true)
    
    // Only generate stars for themes that need them
    if (!hasStarryBackground) return
    
    // Generate fixed stars with theme-specific colors
    const generateStars = () => {
      const newStars: Star[] = []
      const starCount = 200 // Lots of stars
      
      // Get theme-specific star colors
      const getStarColors = () => {
        if (isMidnightTheme) {
          return {
            primary: 'text-blue-100',
            secondary: 'text-indigo-200',
            accent: 'text-purple-200'
          }
        } else { // dark theme
          return {
            primary: 'text-white',
            secondary: 'text-blue-200',
            accent: 'text-blue-100'
          }
        }
      }
      
      const colors = getStarColors()
      
      // Small background stars
      for (let i = 0; i < starCount * 0.7; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 1.5 + 0.5, // Size between 0.5-2px
          x: Math.random() * 100, // Position X (0-100%)
          y: Math.random() * 100, // Position Y (0-100%)
          type: 'small',
          color: Math.random() > 0.9 ? colors.secondary : colors.primary
        })
      }
      
      // Medium stars
      for (let i = Math.floor(starCount * 0.7); i < starCount * 0.9; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 2 + 1.5, // Size between 1.5-3.5px
          x: Math.random() * 100, // Position X (0-100%)
          y: Math.random() * 100, // Position Y (0-100%)
          type: 'medium',
          color: Math.random() > 0.8 ? colors.accent : colors.primary
        })
      }
      
      // Large stars
      for (let i = Math.floor(starCount * 0.9); i < starCount; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 2.5 + 2, // Size between 2-4.5px
          x: Math.random() * 100, // Position X (0-100%)
          y: Math.random() * 100, // Position Y (0-100%)
          type: 'large',
          color: Math.random() > 0.7 ? colors.secondary : colors.primary
        })
      }
      
      setStars(newStars)
    }
    
    // Generate shooting stars
    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = []
      const shootingStarCount = 8 // Number of shooting stars
      
      for (let i = 0; i < shootingStarCount; i++) {
        newShootingStars.push({
          id: i,
          x: Math.random() * 100, // Start position X (0-100%)
          y: Math.random() * 50, // Start position Y (0-50%)
          size: Math.random() * 3 + 2, // Size between 2-5px
          duration: Math.random() * 2 + 1, // Duration between 1-3s
          delay: Math.random() * 15 + i * 2, // Staggered delays
        })
      }
      
      setShootingStars(newShootingStars)
    }

    generateStars()
    generateShootingStars()
    
    // Regenerate shooting stars periodically
    const interval = setInterval(() => {
      if (hasStarryBackground) {
        generateShootingStars()
      }
    }, 20000) // Every 20 seconds
    
    return () => clearInterval(interval)
  }, [hasStarryBackground, isDarkTheme, isMidnightTheme])

  if (!mounted) return null

  // Render forest theme background
  if (isForestTheme) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute inset-0 bg-black/20 z-0" /> {/* Reduced overlay opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            filter: "brightness(0.8) saturate(1.2)"
          }}
        />
      </div>
    )
  }
  
  // Render sunset theme background
  if (isSunsetTheme) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute inset-0 bg-black/15 z-0" /> {/* Reduced overlay opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
            filter: "brightness(0.9) saturate(1.3)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/50 via-purple-900/30 to-transparent" />
      </div>
    )
  }
  
  // Render midnight theme with special background
  if (isMidnightTheme) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-blue-950 to-purple-950" />
        {/* Stars overlay */}
        <div className="absolute inset-0">
          {stars.map((star) => {
            // Different animation based on star type
            let animationProps = {};
            let animationDuration = 0;
            
            switch(star.type) {
              case 'small':
                animationProps = {
                  opacity: [0.1, 0.4, 0.1],
                  scale: [0.8, 1, 0.8],
                };
                animationDuration = 3 + (star.id % 5);
                break;
              case 'medium':
                animationProps = {
                  opacity: [0.2, 0.7, 0.2],
                  scale: [0.8, 1.2, 0.8],
                };
                animationDuration = 4 + (star.id % 4);
                break;
              case 'large':
                animationProps = {
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.3, 0.8],
                };
                animationDuration = 5 + (star.id % 3);
                break;
            }
            
            return (
              <motion.div
                key={star.id}
                className={`absolute rounded-full ${
                  star.color === 'text-white' ? 'bg-white' : 
                  star.color === 'text-blue-100' ? 'bg-blue-100' : 
                  star.color === 'text-indigo-200' ? 'bg-indigo-200' :
                  star.color === 'text-purple-200' ? 'bg-purple-200' :
                  'bg-blue-200'}`}
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  boxShadow: star.type === 'large' ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.7)` : 'none'
                }}
                animate={animationProps}
                transition={{
                  duration: animationDuration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: star.id % 10 * 0.2,
                }}
              />
            );
          })}
          
          {/* Shooting stars */}
          {shootingStars.map((star) => (
            <motion.div
              key={`shooting-${star.id}`}
              className="absolute">
              <motion.div
                className="h-px bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${star.size}px`,
                  borderRadius: '100%',
                  filter: 'blur(1px)',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.7)'
                }}
                initial={{
                  x: `${star.x}%`,
                  y: `${star.y}%`,
                  opacity: 0,
                  rotate: Math.random() * 45 - 65, // Random angle between -65 and -20 degrees
                }}
                animate={{
                  x: `${star.x + 30}%`,
                  y: `${star.y + 30}%`,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 20 + 10,
                  ease: "easeOut",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }
  
  // Render starry background for dark theme
  if (isDarkTheme) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        {/* Fixed stars with twinkling effect */}
        {stars.map((star) => {
          // Different animation based on star type
          let animationProps = {};
          let animationDuration = 0;
          
          switch(star.type) {
            case 'small':
              animationProps = {
                opacity: [0.1, 0.4, 0.1],
                scale: [0.8, 1, 0.8],
              };
              animationDuration = 3 + (star.id % 5);
              break;
            case 'medium':
              animationProps = {
                opacity: [0.2, 0.7, 0.2],
                scale: [0.8, 1.2, 0.8],
              };
              animationDuration = 4 + (star.id % 4);
              break;
            case 'large':
              animationProps = {
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.3, 0.8],
              };
              animationDuration = 5 + (star.id % 3);
              break;
          }
          
          return (
            <motion.div
              key={star.id}
              className={`absolute rounded-full ${star.color === 'text-white' ? 'bg-white' : 
                star.color === 'text-blue-100' ? 'bg-blue-100' : 
                star.color === 'text-indigo-200' ? 'bg-indigo-200' :
                star.color === 'text-purple-200' ? 'bg-purple-200' :
                star.color === 'text-blue-200' ? 'bg-blue-200' : 'bg-white'}`}
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                left: `${star.x}%`,
                top: `${star.y}%`,
                boxShadow: star.type === 'large' ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.7)` : 'none'
              }}
              animate={animationProps}
              transition={{
                duration: animationDuration,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: star.id % 10 * 0.2,
              }}
            />
          );
        })}
        
        {/* Shooting stars */}
        {shootingStars.map((star) => (
          <motion.div
            key={`shooting-${star.id}`}
            className="absolute">
            <motion.div
              className="h-px bg-gradient-to-r from-transparent via-white to-transparent"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${star.size}px`,
                borderRadius: '100%',
                filter: 'blur(1px)',
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.7)'
              }}
              initial={{
                x: `${star.x}%`,
                y: `${star.y}%`,
                opacity: 0,
                rotate: Math.random() * 45 - 65, // Random angle between -65 and -20 degrees
              }}
              animate={{
                x: `${star.x + 30}%`,
                y: `${star.y + 30}%`,
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: star.duration,
                delay: star.delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 20 + 10,
                ease: "easeOut",
              }}
            />
          </motion.div>
        ))}
      </div>
    )
  }
  
  // For light theme or any other theme, return null
  return null
}
