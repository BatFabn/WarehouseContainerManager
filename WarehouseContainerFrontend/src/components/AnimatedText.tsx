import { motion } from "framer-motion";

const AnimatedText = () => {
  const words = ["Manage", "your", "warehouse container's"];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        flexDirection: "column",
      }}
    >
      {words.map((word, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.3,
            duration: 1,
            ease: "easeOut",
            repeat: Infinity,
            repeatDelay: 4,
          }}
          style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "#ff6347",
            textTransform: "uppercase",
            letterSpacing: "2px",
            marginBottom: "10px", // Space between words
          }}
        >
          {word}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedText;
