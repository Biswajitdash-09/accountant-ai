import { useState, useRef, ReactNode } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Trash2, Edit } from 'lucide-react';

interface SwipeableCardProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

export const SwipeableCard = ({ children, onDelete, onEdit, className = '' }: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const constraintsRef = useRef(null);

  const backgroundColor = useTransform(
    x,
    [-150, 0, 150],
    ['rgb(239, 68, 68)', 'transparent', 'rgb(59, 130, 246)']
  );

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < -100 && onDelete) {
      onDelete();
    } else if (info.offset.x > 100 && onEdit) {
      onEdit();
    }
  };

  return (
    <div ref={constraintsRef} className="relative overflow-hidden">
      {/* Background Actions */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-6"
        style={{ backgroundColor }}
      >
        <div className="text-white flex items-center gap-2">
          <Edit className="h-5 w-5" />
          <span className="font-medium">Edit</span>
        </div>
        <div className="text-white flex items-center gap-2">
          <span className="font-medium">Delete</span>
          <Trash2 className="h-5 w-5" />
        </div>
      </motion.div>

      {/* Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`bg-card relative z-10 ${className} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {children}
      </motion.div>
    </div>
  );
};
