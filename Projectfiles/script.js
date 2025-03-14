document.addEventListener('DOMContentLoaded', function() {
    // Remove loader when page is loaded
    setTimeout(() => {
        document.querySelector('.loader').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.loader').style.display = 'none';
        }, 500);
    }, 1500);

    // Toggle sidebar on mobile
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    toggleSidebar.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (!event.target.closest('#sidebar') && !event.target.closest('#toggle-sidebar') && window.innerWidth <= 992) {
            sidebar.classList.remove('active');
        }
    });

    // Modal functionality
    const addOrderBtn = document.getElementById('add-order');
    const orderModal = document.getElementById('order-modal');
    const closeModal = document.getElementById('close-modal');
    const orderForm = document.getElementById('order-form');
    const orderAlert = document.getElementById('order-alert');

    addOrderBtn.addEventListener('click', function() {
        orderModal.style.display = 'flex';
        // Set today's date as default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('order-date').value = today;
    });

    closeModal.addEventListener('click', function() {
        orderModal.style.display = 'none';
        orderForm.reset();
        orderAlert.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target == orderModal) {
            orderModal.style.display = 'none';
            orderForm.reset();
            orderAlert.style.display = 'none';
        }
    });

    // Handle form submission
    orderForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const customerName = document.getElementById('customer-name').value;
        const productName = document.getElementById('product-name').value;
        const orderAmount = document.getElementById('order-amount').value;
        const orderStatus = document.getElementById('order-status').value;
        const orderDate = document.getElementById('order-date').value;
        
        // Generate order ID
        const orderCount = document.getElementById('orders-table').getElementsByTagName('tr').length;
        const newOrderId = `#ORD-2025-${8742 + orderCount + 1}`;
        
        // Format date for display
        const displayDate = new Date(orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Create new order row
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${newOrderId}</td>
            <td>${customerName}</td>
            <td>${productName}</td>
            <td>${displayDate}</td>
            <td>$${parseFloat(orderAmount).toFixed(2)}</td>
            <td><span class="status ${orderStatus}">${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</span></td>
        `;
        
        // Add to the beginning of the table
        const tableBody = document.getElementById('orders-table');
        tableBody.insertBefore(newRow, tableBody.firstChild);
        
        // Show success message
        orderAlert.className = 'alert alert-success';
        orderAlert.textContent = 'Order added successfully!';
        orderAlert.style.display = 'block';
        
        // Reset form after 2 seconds
        setTimeout(() => {
            orderForm.reset();
            orderAlert.style.display = 'none';
            orderModal.style.display = 'none';
        }, 2000);
        
        // Update revenue metric for demo purposes
        updateMetricsAfterOrder(parseFloat(orderAmount));
    });

    // Function to update metrics after adding an order
    function updateMetricsAfterOrder(amount) {
        // Update revenue
        const revenueElement = document.querySelector('.revenue .metric-value');
        const currentRevenue = parseFloat(revenueElement.textContent.replace(/[$,]/g, ''));
        const newRevenue = currentRevenue + amount;
        revenueElement.textContent = `$${newRevenue.toLocaleString()}`;
        
        // Update orders count
        const ordersElement = document.querySelector('.orders .metric-value');
        const currentOrders = parseInt(ordersElement.textContent.replace(/,/g, ''));
        ordersElement.textContent = (currentOrders + 1).toLocaleString();
    }

    // Initialize Charts
    const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
    let chartType = 'line';
    let revenueChart;
    
    // Data for charts
    const revenueData = {
        labels: ['Mar 1', 'Mar 2', 'Mar 3', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7', 'Mar 8', 'Mar 9', 'Mar 10', 'Mar 11', 'Mar 12', 'Mar 13', 'Mar 14'],
        datasets: [
            {
                label: 'Revenue',
                data: [12500, 14200, 13800, 15600, 14900, 16200, 15800, 17300, 16800, 18100, 17600, 19200, 18700, 19800],
                borderColor: '#ff9900',
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Orders',
                data: [520, 580, 540, 620, 590, 650, 630, 680, 660, 710, 690, 730, 710, 740],
                borderColor: '#146eb4',
                backgroundColor: 'rgba(20, 110, 180, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    // Create initial chart
    createChart(chartType);

    // Toggle chart type
    document.getElementById('toggle-chart').addEventListener('click', function() {
        chartType = chartType === 'line' ? 'bar' : 'line';
        createChart(chartType);
    });

    // Function to create/update the chart
    function createChart(type) {
        if (revenueChart) {
            revenueChart.destroy();
        }
        
        revenueChart = new Chart(revenueCtx, {
            type: type,
            data: revenueData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(35, 47, 62, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (context.dataset.label === 'Revenue') {
                                        label += new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD'
                                        }).format(context.parsed.y);
                                    } else {
                                        label += context.parsed.y;
                                    }
                                }
                                return label;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Download chart as image
    document.getElementById('download-chart').addEventListener('click', function() {
        const canvas = document.getElementById('revenue-chart');
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'revenue-chart.png';
        link.href = image;
        link.click();
    });

    // Refresh buttons functionality (simulated)
    document.getElementById('refresh-btn').addEventListener('click', simulateRefresh);
    document.getElementById('refresh-orders').addEventListener('click', simulateRefresh);
    document.getElementById('refresh-products').addEventListener('click', simulateRefresh);

    // Export button functionality
    document.getElementById('export-btn').addEventListener('click', function() {
        alert('Analytics data exported successfully!');
    });

    // Simulate refresh with loading spinner
    function simulateRefresh() {
        document.querySelector('.loader').style.display = 'flex';
        setTimeout(() => {
            document.querySelector('.loader').style.opacity = '1';
            setTimeout(() => {
                document.querySelector('.loader').style.opacity = '0';
                setTimeout(() => {
                    document.querySelector('.loader').style.display = 'none';
                }, 500);
            }, 1000);
        }, 0);
    }

    // Handle window resize to adjust charts
    window.addEventListener('resize', function() {
        if (revenueChart) {
            revenueChart.resize();
        }
    });

    // Apply random data changes every 30 seconds for a dynamic feel
    setInterval(() => {
        // Update revenue chart with slight random changes
        for (let i = 0; i < revenueData.datasets[0].data.length; i++) {
            const change = Math.random() * 1000 - 500; // Random change between -500 and +500
            revenueData.datasets[0].data[i] = Math.max(10000, revenueData.datasets[0].data[i] + change);
            
            const orderChange = Math.random() * 20 - 10; // Random change between -10 and +10
            revenueData.datasets[1].data[i] = Math.max(500, revenueData.datasets[1].data[i] + orderChange);
        }
        
        // Update chart
        revenueChart.update();
    }, 30000);
});