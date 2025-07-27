document.addEventListener('DOMContentLoaded', () => {
    const currentTimeEl = document.getElementById('current-time');
    const netWorthEl = document.getElementById('net-worth');
    const portfolioTotalEl = document.getElementById('portfolio-total');
    const dayChangeEl = document.getElementById('day-change');
    const dayChangePercentEl = document.getElementById('day-change-percent');
    const buyingPowerEl = document.getElementById('buying-power');
    const assetProgressEl = document.getElementById('asset-progress');
    const miniChartCanvas = document.getElementById('miniChart');
    const mainChartCanvas = document.getElementById('mainChart');
    const watchlistBody = document.getElementById('watchlist-body');
    const addToWatchlistInput = document.getElementById('addToWatchlistInput');
    const addToWatchlistBtn = document.getElementById('addToWatchlistBtn');
    const notificationEl = document.getElementById('notification');
    const countdownHoursEl = document.getElementById('countdown-hours');
    const countdownMinutesEl = document.getElementById('countdown-minutes');
    const countdownSecondsEl = document.getElementById('countdown-seconds');
    const newsCarousel = document.getElementById('newsCarousel');
    const newsDots = document.querySelectorAll('.cyber-carousel-dot');
    const newsAutoScrollCheckbox = document.getElementById('newsAutoScroll');
    const refreshNewsBtn = document.getElementById('refreshNews');
    const matrixRainContainer = document.getElementById('matrixRain');
    const particlesContainer = document.getElementById('particles');

    let mainChart;
    let miniChart;
    let newsInterval;

    // --- Core Functions ---

    const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    };

    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = current.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const updateMarketData = () => {
        // Mock data updates
        const newNetWorth = 1245890 + (Math.random() - 0.5) * 10000;
        animateValue(netWorthEl, parseFloat(netWorthEl.textContent.replace(/,/g, '')), newNetWorth, 500);
        animateValue(portfolioTotalEl, parseFloat(portfolioTotalEl.textContent.replace(/,/g, '')), newNetWorth, 500);

        const newDayChange = (Math.random() * 50000).toFixed(2);
        const newDayChangePercent = (Math.random() * 5).toFixed(2);
        dayChangeEl.textContent = `${parseFloat(newDayChange).toLocaleString()}`;
        dayChangePercentEl.textContent = `+${newDayChangePercent}%`;

        // Update watchlist
        const watchlistItems = watchlistBody.querySelectorAll('tr');
        watchlistItems.forEach(item => {
            const priceEl = item.querySelector('.price');
            const changeEl = item.querySelector('.change');
            const currentPrice = parseFloat(priceEl.textContent.replace('₡ ', ''));
            const change = (Math.random() - 0.5) * 5;
            const newPrice = currentPrice + change;
            const percentChange = (change / currentPrice) * 100;

            priceEl.textContent = `₡ ${newPrice.toFixed(2)}`;
            changeEl.innerHTML = `
                <span class="${change >= 0 ? 'stock-up' : 'stock-down'}">
                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}
                </span>
            `;
            item.querySelectorAll('td')[3].innerHTML = `
                <span class="${change >= 0 ? 'stock-up' : 'stock-down'}">
                    ${change >= 0 ? '+' : ''}${percentChange.toFixed(2)}%
                </span>
            `;
        });
    };

    // --- Charting ---

    const generateChartData = () => {
        const data = [];
        let last = 100;
        const now = new Date();
        for (let i = 0; i < 60; i++) {
            const date = new Date(now.getTime() - (60 - i) * 60000);
            last += (Math.random() - 0.5) * 5;
            data.push({x: date, y: last});
        }
        return data;
    };

    const createMainChart = () => {
        const ctx = mainChartCanvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(5, 217, 232, 0.5)');
        gradient.addColorStop(1, 'rgba(5, 217, 232, 0)');

        mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'ARASAKA (ASK)',
                    data: generateChartData(),
                    borderColor: '#05d9e8',
                    backgroundColor: gradient,
                    pointRadius: 0,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute'
                        },
                        grid: {
                            color: 'rgba(5, 217, 232, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(5, 217, 232, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return '₡ ' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    };

    const createMiniChart = () => {
        const ctx = miniChartCanvas.getContext('2d');
        miniChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    data: generateChartData().slice(-20),
                    borderColor: '#ff2a6d',
                    pointRadius: 0,
                    borderWidth: 1.5,
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                animation: {
                    duration: 0
                }
            }
        });
    };

    // --- Watchlist ---

    const initialWatchlist = [
        { symbol: 'ASK', price: 152.34, change: 2.12, volume: '1.2M' },
        { symbol: 'MLT', price: 88.76, change: -1.05, volume: '890K' },
        { symbol: 'BCH', price: 210.50, change: 5.50, volume: '2.1M' },
        { symbol: 'ZET', price: 45.12, change: 0.15, volume: '500K' }
    ];

    const renderWatchlist = () => {
        watchlistBody.innerHTML = '';
        initialWatchlist.forEach(stock => addStockToWatchlist(stock));
    };

    const addStockToWatchlist = (stock) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-800 hover:bg-gray-800 bg-opacity-50 transition-colors';
        const changeClass = stock.change >= 0 ? 'stock-up' : 'stock-down';

        row.innerHTML = `
            <td class="py-2 px-3 font-bold neon-text-pink">${stock.symbol}</td>
            <td class="py-2 px-3 price">₡ ${stock.price.toFixed(2)}</td>
            <td class="py-2 px-3 change"><span class="${changeClass}">${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}</span></td>
            <td class="py-2 px-3"><span class="${changeClass}">${stock.change >= 0 ? '+' : ''}${(stock.change / stock.price * 100).toFixed(2)}%</span></td>
            <td class="py-2 px-3 text-gray-400">${stock.volume}</td>
            <td class="py-2 px-3 text-right">
                <button class="cyber-button text-xs bg-neon-blue bg-opacity-20 text-neon-blue border border-neon-blue px-2 py-1 rounded">Trade</button>
            </td>
        `;
        watchlistBody.appendChild(row);
    };

    addToWatchlistBtn.addEventListener('click', () => {
        const symbol = addToWatchlistInput.value.toUpperCase();
        if (symbol) {
            addStockToWatchlist({
                symbol,
                price: (Math.random() * 200).toFixed(2),
                change: (Math.random() - 0.5) * 10,
                volume: `${(Math.random() * 2).toFixed(1)}M`
            });
            addToWatchlistInput.value = '';
            showNotification(`Added ${symbol} to watchlist.`);
        }
    });

    // --- UI Effects & Animations ---

    const showNotification = (message) => {
        notificationEl.querySelector('p:last-child').textContent = message;
        notificationEl.classList.add('show');
        setTimeout(() => {
            notificationEl.classList.remove('show');
        }, 3000);
    };

    const updateCountdown = () => {
        const now = new Date();
        const marketClose = new Date();
        marketClose.setHours(22, 0, 0, 0); // Assume market closes at 10 PM

        let diff = marketClose - now;
        if (diff < 0) diff = 0;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);
        const seconds = Math.floor(diff / 1000);

        countdownHoursEl.textContent = String(hours).padStart(2, '0');
        countdownMinutesEl.textContent = String(minutes).padStart(2, '0');
        countdownSecondsEl.textContent = String(seconds).padStart(2, '0');

        if (hours < 1) {
            document.querySelector('.cyber-countdown').classList.add('danger');
        }
    };

    // News Carousel
    let currentSlide = 0;
    const slides = newsCarousel.querySelectorAll('.cyber-carousel-slide');

    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        newsDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    };

    const nextSlide = () => {
        showSlide((currentSlide + 1) % slides.length);
    };

    newsDots.forEach(dot => {
        dot.addEventListener('click', () => {
            showSlide(parseInt(dot.dataset.slide));
            resetNewsInterval();
        });
    });

    const resetNewsInterval = () => {
        clearInterval(newsInterval);
        if (newsAutoScrollCheckbox.checked) {
            newsInterval = setInterval(nextSlide, 5000);
        }
    };

    newsAutoScrollCheckbox.addEventListener('change', resetNewsInterval);
    refreshNewsBtn.addEventListener('click', () => {
        // Mock news refresh
        refreshNewsBtn.querySelector('i').classList.add('fa-spin');
        setTimeout(() => {
            refreshNewsBtn.querySelector('i').classList.remove('fa-spin');
            showNotification('News feed updated.');
        }, 1000);
    });

    // Matrix Rain
    const createMatrixRain = () => {
        const canvas = document.createElement('canvas');
        matrixRainContainer.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const fontSize = 12;
        const columns = canvas.width / fontSize;

        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        function draw() {
            ctx.fillStyle = 'rgba(13, 2, 33, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff9d';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(draw, 33);
    };

    // Particles
    const createParticles = () => {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 3 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animation = `particle-anim ${Math.random() * 10 + 5}s linear infinite`;
            particlesContainer.appendChild(particle);
        }
    };

    // Add particle animation keyframes to style
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes particle-anim {
            from { transform: translate(0, 0); opacity: 1; }
            to { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);


    // --- Initialization ---

    const init = () => {
        updateTime();
        setInterval(updateTime, 1000);

        updateCountdown();
        setInterval(updateCountdown, 1000);

        createMainChart();
        createMiniChart();
        renderWatchlist();

        setInterval(updateMarketData, 3000);
        setInterval(() => {
            const newData = {
                x: new Date(),
                y: mainChart.data.datasets[0].data[mainChart.data.datasets[0].data.length - 1].y + (Math.random() - 0.5) * 5
            };
            mainChart.data.datasets[0].data.push(newData);
            mainChart.data.datasets[0].data.shift();
            miniChart.data.datasets[0].data.push(newData);
            miniChart.data.datasets[0].data.shift();
            mainChart.update('quiet');
            miniChart.update('quiet');
        }, 2000);

        resetNewsInterval();
        createMatrixRain();
        createParticles();

        console.log("NEON TRADER 2077 Interface Initialized.");
    };

    init();
});
