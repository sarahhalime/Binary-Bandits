import React from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground.tsx';

const bubbleColors = [
	'rgba(255,255,255,0.35)',
	'rgba(255,255,255,0.25)',
	'rgba(255,255,255,0.18)',
];

const bubbles = Array.from({ length: 14 }).map((_, i) => ({
	size: Math.random() * 120 + 80,
	left: Math.random() * 90 + '%',
	top: Math.random() * 90 + '%',
	color: bubbleColors[i % bubbleColors.length],
	duration: Math.random() * 12 + 8,
	delay: Math.random() * 6,
	blur: Math.random() * 10 + 8,
	opacity: Math.random() * 0.3 + 0.2,
}));

const cardData = [
	{ title: 'Achievements', description: 'View your progress and badges.' },
	{ title: 'Mood Tracker', description: 'Track your daily mood.' },
	{ title: 'Journal', description: 'Write and reflect on your day.' },
	{ title: 'Music', description: 'Listen to curated playlists.' },
	{ title: 'Social', description: 'Connect with friends.' },
];

const containerVariants = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: {
			staggerChildren: 0.15,
			delayChildren: 0.2,
		},
	},
};

const cardVariants = {
	hidden: { opacity: 0, y: 40 },
	visible: { opacity: 1, y: 0 },
};

const Dashboard: React.FC = () => {
	return (
			<div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #d1c4e9 0%, #f8bbd0 100%)' }}>
				<AnimatedBackground />
			{/* Animated Bubbles */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									width: '100%',
									height: '100%',
									pointerEvents: 'none',
									zIndex: 2,
								}}
							>
								{bubbles.map((bubble, i) => (
									<motion.div
										key={i}
										initial={{ y: 0, scale: 1 }}
										animate={{ y: -80, scale: 1.08 }}
										transition={{ repeat: Infinity, repeatType: 'reverse', duration: bubble.duration, delay: bubble.delay, ease: 'easeInOut' }}
										style={{
											position: 'absolute',
											left: bubble.left,
											top: bubble.top,
											width: bubble.size,
											height: bubble.size,
											borderRadius: '50%',
											background: bubble.color,
											boxShadow: `0 0 60px 10px ${bubble.color}`,
											filter: `blur(${bubble.blur}px)`,
											opacity: bubble.opacity,
											zIndex: 2,
											border: '1.5px solid rgba(255,255,255,0.5)',
											transition: 'background 0.3s',
										}}
									/>
								))}
							</div>
					<motion.div
						className="relative z-20 flex flex-col items-center w-full"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						<h1 className="text-5xl font-extrabold mb-10 text-purple-900 drop-shadow-lg">Welcome to Your Dashboard</h1>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl">
							{cardData.map((card, idx) => (
								<motion.div
									key={card.title}
									className="bg-gradient-to-br from-white/80 via-purple-100 to-pink-200 rounded-2xl shadow-2xl p-8 flex flex-col items-center hover:scale-110 transition-transform duration-300 border-2 border-white/30 backdrop-blur-md"
									variants={cardVariants}
									whileHover={{ scale: 1.13, boxShadow: '0 12px 40px rgba(186,85,211,0.25)' }}
								>
									<h2 className="text-3xl font-bold text-purple-700 mb-3 drop-shadow">{card.title}</h2>
									<p className="text-purple-900/80 text-center text-lg">{card.description}</p>
								</motion.div>
							))}
						</div>
					</motion.div>
		</div>
	);
};

export default Dashboard;
