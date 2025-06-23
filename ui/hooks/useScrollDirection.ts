import { useState, useEffect } from 'react';

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Set isScrolled based on scroll position
      setIsScrolled(scrollY > 20);
      
      // Determine scroll direction
      if (scrollY > lastScrollY && scrollY > 100) {
        // Scrolling down and past threshold
        setScrollDirection('down');
      } else if (scrollY < lastScrollY || scrollY <= 100) {
        // Scrolling up or near top
        setScrollDirection('up');
      }
      
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return { scrollDirection, isScrolled };
} 