import React from 'react';

const bubbleStyles = [
	{ top: '10%', left: '15%', size: 80, delay: '0s' },
	{ top: '30%', left: '70%', size: 60, delay: '1s' },
	{ top: '60%', left: '25%', size: 100, delay: '2s' },
	{ top: '80%', left: '80%', size: 50, delay: '0.5s' },
	{ top: '50%', left: '50%', size: 70, delay: '1.5s' },
];

export default function AnimatedBubbles() {
	return (
		<div className="absolute inset-0 w-full h-full pointer-events-none z-0">
			{bubbleStyles.map((bubble, idx) => (
				<span
					key={idx}
					className="absolute rounded-full bg-white bg-opacity-20 animate-bubble"
					style={{
						top: bubble.top,
						left: bubble.left,
						width: bubble.size,
						height: bubble.size,
						animationDelay: bubble.delay,
					}}
				/>
			))}
			{/* Bird SVG animation */}
			<svg
				className="absolute animate-bird"
				style={{ top: '20%', left: '5%', width: 60, height: 60 }}
				viewBox="0 0 60 60"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M10 30 Q 30 10, 50 30 Q 30 50, 10 30 Z"
					fill="#fff"
					fillOpacity="0.7"
				/>
				<circle cx="30" cy="30" r="8" fill="#fbbf24" />
			</svg>
		</div>
	);
}
