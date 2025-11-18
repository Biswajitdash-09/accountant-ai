import { Variants } from "framer-motion";

export const paymentAnimations = {
  // Card hover with 3D tilt
  cardHover: {
    rest: {
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: {
      scale: 1.05,
      rotateX: 5,
      rotateY: 5,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  },

  // Card flip animation
  cardFlip: {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeInOut" }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  },

  // Stagger children for lists
  staggerContainer: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  },

  // Modal slide up
  modalSlideUp: {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      y: 100,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  },

  // Success confetti burst
  confetti: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: [0, 1.5, 1],
      opacity: [0, 1, 0],
      transition: { 
        duration: 1.5,
        times: [0, 0.5, 1],
        ease: "easeOut"
      }
    }
  },

  // Error shake
  shake: {
    initial: { x: 0 },
    animate: {
      x: [-10, 10, -10, 10, 0],
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  },

  // Pulse for attention
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Progress bar fill
  progressFill: {
    initial: { width: "0%" },
    animate: (progress: number) => ({
      width: `${progress}%`,
      transition: { duration: 0.5, ease: "easeOut" }
    })
  },

  // Checkmark draw
  checkmarkDraw: {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        pathLength: { duration: 0.8, ease: "easeInOut" },
        opacity: { duration: 0.3 }
      }
    }
  },

  // Number counter
  numberCount: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  },

  // Fade slide
  fadeSlide: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.3 }
    }
  },

  // Scale in
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  },

  // Glow effect
  glow: {
    animate: {
      boxShadow: [
        "0 0 20px rgba(59, 130, 246, 0.5)",
        "0 0 40px rgba(59, 130, 246, 0.8)",
        "0 0 20px rgba(59, 130, 246, 0.5)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Bounce
  bounce: {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Rotate
  rotate: {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  },

  // Background gradient shift
  gradientShift: {
    animate: {
      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }
};

// Preset animation combinations for common use cases
export const paymentPresets = {
  planCard: {
    whileHover: { scale: 1.03, y: -5 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },

  paymentButton: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },

  statusBadge: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring", stiffness: 500, damping: 30 }
  },

  successIcon: {
    initial: { scale: 0, rotate: -180 },
    animate: { scale: 1, rotate: 0 },
    transition: { type: "spring", stiffness: 200, damping: 15 }
  },

  errorIcon: {
    initial: { scale: 0 },
    animate: { scale: [0, 1.2, 1] },
    transition: { duration: 0.5 }
  }
};
