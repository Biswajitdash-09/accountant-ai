import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, X, DollarSign, TrendingDown, FileText, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

const quickActions = [
  {
    icon: TrendingDown,
    label: 'Add Expense',
    color: 'bg-red-500',
    action: '/transactions?type=expense',
  },
  {
    icon: DollarSign,
    label: 'Add Income',
    color: 'bg-green-500',
    action: '/transactions?type=income',
  },
  {
    icon: Receipt,
    label: 'Scan Receipt',
    color: 'bg-blue-500',
    action: '/upload',
  },
  {
    icon: FileText,
    label: 'View Reports',
    color: 'bg-purple-500',
    action: '/reports',
  },
];

export const MobileQuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const handleAction = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="flex flex-col gap-3 mb-4"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    onClick={() => handleAction(action.action)}
                    className={`${action.color} text-white shadow-lg h-14 px-4 gap-3 hover:opacity-90`}
                  >
                    <action.icon className="h-5 w-5" />
                    <span className="font-medium">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={`h-14 w-14 rounded-full shadow-lg ${
            isOpen ? 'bg-destructive' : 'bg-primary'
          }`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </motion.div>
        </Button>
      </div>
    </>
  );
};
