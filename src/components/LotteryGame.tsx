// LotteryGame.tsx
import React, {useState, useRef, useEffect} from 'react';
import microwave from "../assets/img/microwave-jackpot.png"

interface LotteryNumber {
    value: number;
    selected: boolean;
}

const LotteryGame: React.FC = () => {
    // Generate 20 numbers
    const [numbers, setNumbers] = useState<LotteryNumber[]>(() =>
        Array.from({length: 20}, (_, i) => ({
            value: i + 1,
            selected: false
        }))
    );

    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [credits, setCredits] = useState<number>(500);
    const [nextDraw, setNextDraw] = useState<Date>(getNextDrawTime());
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [hoveredBall, setHoveredBall] = useState<number | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    // Microwave prize only
    const prize = {
        id: '1',
        name: 'MICROWAVE JACKPOT',
        value: 'Premium Microwave',
        image: microwave
    };

    // Calculate next draw time (always at 17:00 PM)
    function getNextDrawTime(): Date {
        const now = new Date();
        const nextDraw = new Date();

        // Always set to 17:00 (5 PM)
        nextDraw.setHours(17, 0, 0, 0);

        // If current time is after 17:00 today, set to 17:00 tomorrow
        if (now.getHours() >= 17) {
            nextDraw.setDate(nextDraw.getDate() + 1);
        }

        return nextDraw;
    }

    // Function for time-based encouragement
    const getEncouragingMessage = () => {
        const now = new Date();
        const nextDrawTime = new Date(nextDraw);
        const timeDiff = nextDrawTime.getTime() - now.getTime();
        const hoursUntilDraw = Math.floor(timeDiff / (1000 * 60 * 60));

        if (hoursUntilDraw > 12) {
            return "Ticket confirmed!";
        } else if (hoursUntilDraw > 6) {
            return "You're entered! The draw is getting closer!";
        } else if (hoursUntilDraw > 3) {
            return "Almost there! Your microwave awaits!";
        } else if (hoursUntilDraw > 1) {
            return "Just a little longer! Good luck!";
        } else {
            return "Get ready! The draw is happening soon!";
        }
    };

    // Update countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const diff = nextDraw.getTime() - now.getTime();

            if (diff <= 0) {
                setNextDraw(getNextDrawTime());
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Format with leading zeros for single digits
            const formattedHours = hours.toString().padStart(2, '0');
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = seconds.toString().padStart(2, '0');

            setTimeLeft(`${formattedHours}h ${formattedMinutes}m ${formattedSeconds}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, [nextDraw]);

    // Canvas drawing - both grid and selected numbers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the number grid (4x5 layout)
        drawNumberGrid(ctx);

        // Draw selected numbers in the selection area
        drawSelectedNumbers(ctx);

        // Animation loop
        if (isAnimating) {
            animationRef.current = requestAnimationFrame(() => {
                drawNumberGrid(ctx);
                drawSelectedNumbers(ctx, true);
            });
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [numbers, selectedNumbers, isAnimating, hoveredBall]);

    const drawNumberGrid = (ctx: CanvasRenderingContext2D) => {
        const ballRadius = 80;
        const horizontalSpacing = 180;
        const verticalSpacing = 180;
        const startX = 140;
        const startY = 100;

        // Draw 20 numbers in 4x5 grid with more spacing
        numbers.forEach((number, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const centerX = startX + col * horizontalSpacing;
            const centerY = startY + row * verticalSpacing;

            const isHovered = hoveredBall === index;
            const isSelectable = !(selectedNumbers.length >= 10 && !number.selected);

            // Ball gradient based on selection and hover state
            const gradient = ctx.createRadialGradient(
                centerX - 30, centerY - 30, 15,
                centerX, centerY, ballRadius
            );

            if (number.selected) {
                   // Deep gold
                gradient.addColorStop(0, '#ffed4e');   // Lighter gold on hover
                gradient.addColorStop(0.7, '#ffd700'); // Your theme gold
                gradient.addColorStop(1, '#ff8c00');
            } else if (isHovered && isSelectable) {
                gradient.addColorStop(0, '#ffd700');  // Bright gold
                gradient.addColorStop(0.7, '#ffb347'); // Warm gold
                gradient.addColorStop(1, '#ff8c00');
            } else {
                /* Luxury color combination */
                /* Luxury color combination */
                /* Creates beautiful contrast with gold */
                gradient.addColorStop(0, '#00ffff');   /* Electric cyan */
                gradient.addColorStop(0.7, '#0099ff'); /* Bright blue */
                gradient.addColorStop(1, '#0066ff');   /* Deep blue */
            }

            // Enhanced shadow for hover effect
            if (isHovered && isSelectable) {
                ctx.shadowColor = 'rgba(124, 138, 255, 0.6)';
                ctx.shadowBlur = 35;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            } else {
                ctx.shadowColor = 'rgba(0,0,0,0.26)';
                ctx.shadowBlur = 25;
                ctx.shadowOffsetX = 8;
                ctx.shadowOffsetY = 8;
            }

            // Draw ball
            ctx.beginPath();
            ctx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Highlight effect - enhanced on hover
            const highlightGradient = ctx.createRadialGradient(
                centerX - 25, centerY - 25, 0,
                centerX - 25, centerY - 25, isHovered ? 45 : 35
            );
            highlightGradient.addColorStop(0, isHovered ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.arc(centerX - 25, centerY - 25, isHovered ? 45 : 35, 0, Math.PI * 2);
            ctx.fillStyle = highlightGradient;
            ctx.fill();

            // Number styling with hover effect
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'black';
            ctx.font = `bold ${isHovered ? '52px' : '48px'} Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add text shadow for better readability
            ctx.shadowColor = 'rgb(255,255,255)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 3;
            ctx.fillText(number.value.toString(), centerX, centerY);
            ctx.shadowColor = 'transparent';

            // Hover glow effect
            if (isHovered && isSelectable) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 6;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.arc(centerX, centerY, ballRadius + 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowColor = 'transparent';
            }

            // Selected state border
            if (number.selected) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.arc(centerX, centerY, ballRadius + 4, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Disabled state overlay
            if (selectedNumbers.length >= 10 && !number.selected) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fill();

                // Add cross icon for disabled state
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(centerX - 25, centerY - 25);
                ctx.lineTo(centerX + 25, centerY + 25);
                ctx.moveTo(centerX + 25, centerY - 25);
                ctx.lineTo(centerX - 25, centerY + 25);
                ctx.stroke();
            }

            // Regular border for non-hovered balls
            if (!isHovered && !number.selected) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(centerX, centerY, ballRadius + 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    };

    const drawSelectedNumbers = (ctx: CanvasRenderingContext2D, animate: boolean = false) => {
        const startY = 850;
        const ballRadius = 40;
        const spacing = 90;

        // Draw selection area background
        ctx.fillStyle = 'rgba(52,111,255,0.19)';
        ctx.roundRect(50, startY - 100, 900, 220, 30);
        ctx.fill();

        // Draw "Selected Numbers" title
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.fillText('SELECTED NUMBERS', 500, startY - 60);
        ctx.shadowColor = 'transparent';

        // Draw selected balls in a row with equal spacing
        const totalWidth = selectedNumbers.length * spacing;
        const startX = (1000 - totalWidth) / 2 + spacing / 2 + 25;

        selectedNumbers.forEach((num, index) => {
            const centerX = startX + index * spacing - 25;
            const centerY = startY + 10;

            // Ball gradient
            const gradient = ctx.createRadialGradient(
                centerX - 15, centerY - 15, 8,
                centerX, centerY, ballRadius
            );
            gradient.addColorStop(0, '#ffd700');  // Bright gold
            gradient.addColorStop(0.7, '#ffb347'); // Warm gold
            gradient.addColorStop(1, '#ff8c00');

            // Ball shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            // Draw ball
            ctx.beginPath();
            ctx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Highlight
            const highlightGradient = ctx.createRadialGradient(
                centerX - 12, centerY - 12, 0,
                centerX - 12, centerY - 12, 20
            );
            highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            ctx.arc(centerX - 12, centerY - 12, 20, 0, Math.PI * 2);
            ctx.fillStyle = highlightGradient;
            ctx.fill();

            // Number
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = 'black';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(num.toString(), centerX, centerY);

            // Glow effect for animation
            if (animate) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, ballRadius + 6, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });

        // Draw selection counter
        ctx.fillStyle = '#00c6ff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`SELECTED: ${selectedNumbers.length}/10`, 500, startY + 100);
    };

    // Add rounded rectangle function to CanvasRenderingContext2D
    useEffect(() => {
        if (typeof CanvasRenderingContext2D !== 'undefined') {
            CanvasRenderingContext2D.prototype.roundRect = function (x: number, y: number, w: number, h: number, r: number) {
                if (w < 2 * r) r = w / 2;
                if (h < 2 * r) r = h / 2;
                this.beginPath();
                this.moveTo(x + r, y);
                this.arcTo(x + w, y, x + w, y + h, r);
                this.arcTo(x + w, y + h, x, y + h, r);
                this.arcTo(x, y + h, x, y, r);
                this.arcTo(x, y, x + w, y, r);
                this.closePath();
                return this;
            };
        }
    }, []);

    const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        const ballRadius = 80;
        const horizontalSpacing = 180;
        const verticalSpacing = 180;
        const startX = 140;
        const startY = 100;

        let foundHover = false;

        // Check if mouse is over any ball
        numbers.forEach((number, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const centerX = startX + col * horizontalSpacing;
            const centerY = startY + row * verticalSpacing;

            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

            if (distance <= ballRadius) {
                setHoveredBall(index);
                foundHover = true;
                canvas.style.cursor = (selectedNumbers.length >= 10 && !number.selected) ? 'not-allowed' : 'pointer';
            }
        });

        if (!foundHover) {
            setHoveredBall(null);
            canvas.style.cursor = 'default';
        }
    };

    const handleCanvasMouseLeave = () => {
        setHoveredBall(null);
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.cursor = 'default';
        }
    };

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // Check if click is within the number grid area
        if (y >= 20 && y <= 820) {
            const ballRadius = 80;
            const horizontalSpacing = 180;
            const verticalSpacing = 180;
            const startX = 140;
            const startY = 100;

            // Check each ball's area
            numbers.forEach((number, index) => {
                const row = Math.floor(index / 5);
                const col = index % 5;
                const centerX = startX + col * horizontalSpacing;
                const centerY = startY + row * verticalSpacing;

                // Calculate distance from click to ball center
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

                if (distance <= ballRadius) {
                    handleNumberClick(number);
                    return;
                }
            });
        }
    };

    const handleNumberClick = (number: LotteryNumber) => {
        if (selectedNumbers.length >= 10 && !number.selected) {
            setMessage('You can only select 10 numbers!');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        const updatedNumbers = numbers.map(n =>
            n.value === number.value ? {...n, selected: !n.selected} : n
        );

        setNumbers(updatedNumbers);

        if (number.selected) {
            setSelectedNumbers(selectedNumbers.filter(n => n !== number.value));
        } else {
            setSelectedNumbers([...selectedNumbers, number.value]);
        }

        setMessage('');
    };

    const handleBuyTicket = () => {
        if (selectedNumbers.length !== 10) {
            setMessage('Please select exactly 10 numbers!');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        if (credits < 25) {
            setMessage('Not enough credits!');
            setTimeout(() => setMessage(''), 3000);
            return;
        }

        setCredits(credits - 25);
        setIsAnimating(true);
        setMessage(getEncouragingMessage());

        setTimeout(() => {
            setIsAnimating(false);
            handleReset();
        }, 2000);
    };

    const handleReset = () => {
        setNumbers(numbers.map(n => ({...n, selected: false})));
        setSelectedNumbers([]);
        setMessage('');
    };

    // Quick select buttons
    const handleQuickSelect = (count: number) => {
        const availableNumbers = numbers.filter(n => !n.selected).map(n => n.value);
        const randomNumbers = [...availableNumbers]
            .sort(() => Math.random() - 0.5)
            .slice(0, count);

        // Select these numbers
        const newSelected = [...selectedNumbers, ...randomNumbers].slice(0, 10);
        setSelectedNumbers(newSelected);

        // Update numbers state
        const updatedNumbers = numbers.map(n => ({
            ...n,
            selected: newSelected.includes(n.value)
        }));
        setNumbers(updatedNumbers);
    };

    return (
        <div className="lottery-game">
            <div className="credits-container-main">
                <div className="credits-section">
                    <div className="credits-label">Bal KES:</div>
                    <div className="credits-amount">{credits}</div>
                </div>

                <div className="prize-display">
                    <div className="time-left">{timeLeft}</div>
                </div>
            </div>
            <div className="cred-title">
                <div className="current-prize">
                    <div className="prize-name">{prize.name}</div>
                    <div className="prize-image-container">
                        <img
                            src={prize.image}
                            alt={prize.value}
                            className="prize-image"
                        />
                        <div className="prize-value">{prize.value}</div>
                    </div>
                </div>
            </div>

            {/* Draw Info */}
            <div className="draw-info">
                © Draw: {nextDraw.toLocaleDateString('en-GB')}, {nextDraw.toLocaleTimeString('en-GB', {
                hour: '2-digit',
                minute: '2-digit'
            })}
            </div>

            {/* Main Canvas - Grid and Selected Numbers */}
            <div className="canvas-section">
                <h3>SELECT 10 NUMBERS</h3>
                <div className="canvas-container">
                    <canvas
                        ref={canvasRef}
                        width={1000}
                        height={1000}
                        className="main-canvas"
                        onClick={handleCanvasClick}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseLeave={handleCanvasMouseLeave}
                    />
                </div>

                {/* Quick Select Buttons */}
                <div className="quick-select-buttons">
                    <button
                        className="quick-select-btn"
                        onClick={() => handleQuickSelect(5)}
                        disabled={selectedNumbers.length >= 10}
                    >
                        Quick 5
                    </button>
                    <button
                        className="quick-select-btn"
                        onClick={() => handleQuickSelect(10)}
                        disabled={selectedNumbers.length >= 10}
                    >
                        Quick 10
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <div
                    className={`buy-ticket-btn ${selectedNumbers.length !== 10 ? 'disabled' : ''}`}
                    onClick={selectedNumbers.length === 10 ? handleBuyTicket : undefined}
                >
                    BUY TICKET 30.00
                </div>
                <div
                    className="reset-btn"
                    onClick={handleReset}
                >
                    RESET
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className="message-overlay-toast">
                    <div className="message-display">
                        {message}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LotteryGame;