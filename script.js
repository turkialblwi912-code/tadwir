document.addEventListener('DOMContentLoaded', () => {

    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    const html = document.documentElement;

    const updateChartTheme = () => {
        if (!window.telemetryChart) return;
        const isDark = html.classList.contains('dark');
        const gridColor = isDark ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)';
        const textColor = isDark ? '#94a3b8' : '#475569';
        window.telemetryChart.options.scales.y.grid.color = gridColor;
        window.telemetryChart.options.scales.y.ticks.color = textColor;
        window.telemetryChart.options.scales.x.ticks.color = textColor;
        window.telemetryChart.options.plugins.legend.labels.color = textColor;
        window.telemetryChart.update();
    };

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            html.classList.add('dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            html.classList.remove('dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
        updateChartTheme();
    };

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    const langToggle = document.getElementById('lang-toggle');
    const currentLang = document.documentElement.lang;

    if (langToggle) {
        langToggle.textContent = currentLang === 'ar' ? 'EN' : 'AR';

        langToggle.addEventListener('click', (e) => {
            e.preventDefault(); 
            const targetLang = currentLang === 'en' ? 'ar' : 'en';
            const currentPath = window.location.pathname;
            let newPath;

            if (targetLang === 'ar') {
                newPath = currentPath.replace(/(\/index\.html)?$/, '/index-ar.html');
            } else {
                newPath = currentPath.replace('/index-ar.html', '/index.html');
            }
            window.location.href = newPath;
        });
    }

    let chartUpdateInterval;
    let inferenceInterval;

    const bentoGrid = document.getElementById('bento-grid');
    if (bentoGrid) {
        let animationFrameId = null;
        const onMouseMove = (e) => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                if (window.innerWidth < 1024) return;
                const rect = bentoGrid.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                bentoGrid.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
        };
        bentoGrid.addEventListener('mousemove', onMouseMove, { passive: true });
        bentoGrid.addEventListener('mouseleave', () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            bentoGrid.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }, { passive: true });
    }

    function setupDynamicContent() {
        if (inferenceInterval) clearInterval(inferenceInterval);
        const inferenceRateEl = document.getElementById('inference-rate');
        if (inferenceRateEl) {
            inferenceInterval = setInterval(() => {
                const rate = (Math.random() * 15 + 40).toFixed(2);
                inferenceRateEl.textContent = `${rate} ms`;
            }, 2500);
        }
    }

    function initTelemetryChart() {
        try {
            if (typeof Chart === 'undefined') return;
            const ctx = document.getElementById('telemetryChart');
            if (!ctx) return;

            const initialTempData = [32, 33, 31, 34, 33, 35];
            const initialCpuData = [45, 50, 60, 55, 70, 75];

            window.telemetryChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['-5m', '-4m', '-3m', '-2m', '-1m', 'Live'],
                    datasets: [{
                        label: 'Kiosk Temp (°C)',
                        data: initialTempData,
                        borderColor: 'var(--accent-dark-1)',
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--accent-dark-1)',
                    }, {
                        label: 'CPU Load (%)',
                        data: initialCpuData,
                        borderColor: 'var(--accent-dark-2)',
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 2,
                        pointBackgroundColor: 'var(--accent-dark-2)',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { grid: {}, ticks: {} }, x: { ticks: {} } },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            align: 'start',
                            labels: {
                                font: { family: "'Satoshi', sans-serif", size: 12 },
                                boxWidth: 12,
                                padding: 15,
                            }
                        }
                    }
                }
            });

            if (chartUpdateInterval) clearInterval(chartUpdateInterval);
            chartUpdateInterval = setInterval(() => {
                const chart = window.telemetryChart;
                if (!chart) return;
                chart.data.datasets[0].data.shift();
                chart.data.datasets[0].data.push(Math.floor(Math.random() * 10) + 30);
                chart.data.datasets[1].data.shift();
                chart.data.datasets[1].data.push(Math.floor(Math.random() * 40) + 40);
                chart.update('quiet');
            }, 3000);
        } catch (error) {
            console.error("Error initializing chart:", error);
        }
    }

    function updateChartLabels(lang) {
        if (!window.telemetryChart) return;
        window.telemetryChart.data.datasets[0].label = lang === 'ar' ? 'حرارة الكشك (مئوية)' : 'Kiosk Temp (°C)';
        window.telemetryChart.data.datasets[1].label = lang === 'ar' ? 'استخدام المعالج (%)' : 'CPU Load (%)';
        window.telemetryChart.update('none');
    }

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Submitted (Simulated):', data);
            const alertMessage = document.documentElement.lang === 'ar' ? 'شكراً لرسالتك!' : 'Thank you for your message!';
            alert(alertMessage);
            contactForm.reset();
        });
    }

    const header = document.getElementById('main-header');
    const logo = document.getElementById('header-logo');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            logo.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            logo.classList.remove('scrolled');
        }
    }, { passive: true });

    function setupFaqAccordion() {
        const detailsElements = document.querySelectorAll('#faq-section details');
        detailsElements.forEach(details => {
            const summary = details.querySelector('summary');
            const icon = summary.querySelector('i');

            details.addEventListener('toggle', () => {
                if (details.open) {
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    async function initializePage() {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);
        feather.replace();
        initTelemetryChart();
        updateChartLabels(document.documentElement.lang);
        setupDynamicContent();
        setupFaqAccordion();
    }

    initializePage();
});