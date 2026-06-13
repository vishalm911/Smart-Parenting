import { motion } from 'framer-motion';

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="mb-6 flex justify-center"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img 
            src="/logo.png" 
            alt="SpaceECE Logo" 
            className="h-20 w-auto"
          />
        </motion.div>
        <motion.h2
          className="text-2xl font-extrabold text-dark mb-2"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading SpaceECE...
        </motion.h2>
        <p className="text-gray-600">Preparing your learning adventure</p>
      </motion.div>
    </div>
  );
};
