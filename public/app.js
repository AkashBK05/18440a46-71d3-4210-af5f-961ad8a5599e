const { createApp } = Vue;

createApp({
    data() {
        return {
            devices: [],
            selectedDeviceId: '',
            selectedDevice: null,
            chartData: [],
            totalStats: { carbon_saved: 0, fuel_saved: 0 },
            monthlyStats: { carbon_saved: 0, fuel_saved: 0 },
            selectedRangeStats: { carbon_saved: 0, fuel_saved: 0 },
            startDate: '',
            endDate: '',
            activePreset: '',
            loading: false,
            error: null,
            chart: null
        };
    },

    watch: {
        selectedDeviceId(newDeviceId, oldDeviceId) {
            if (newDeviceId && newDeviceId !== oldDeviceId) {
                this.loadDeviceData();
            }
        }
    },

    async mounted() {
        await this.loadDevices();
        this.initializeDates();

        // Handle window resize for chart
        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
    },

    methods: {
        async loadDevices() {
            try {
                const response = await fetch('/api/devices');
                this.devices = await response.json();

                // Auto-select first device if available
                if (this.devices.length > 0) {
                    this.selectedDeviceId = this.devices[0].id;
                    await this.loadDeviceData();
                }
            } catch (error) {
                this.error = 'Failed to load devices: ' + error.message;
            }
        },

        async loadDeviceData() {
            if (!this.selectedDeviceId) return;

            this.loading = true;
            this.error = null;

            try {
                // Get device details
                const deviceResponse = await fetch(`/api/devices/${this.selectedDeviceId}`);
                this.selectedDevice = await deviceResponse.json();

                // Load all data for total stats
                const allDataResponse = await fetch(`/api/device-savings/${this.selectedDeviceId}`);
                const allData = await allDataResponse.json();

                this.calculateTotalStats(allData.data);

                // Load monthly stats from dedicated endpoint
                const monthlyResponse = await fetch(`/api/device-stats/${this.selectedDeviceId}/monthly`);
                const monthlyData = await monthlyResponse.json();
                this.monthlyStats = monthlyData;

                // Load chart data for current date range
                await this.loadChartData();

                // Ensure chart is initialized after data is loaded
                this.$nextTick(() => {
                    if (this.chartData.length > 0) {
                        this.updateChart();
                    }
                });

            } catch (error) {
                this.error = 'Failed to load device data: ' + error.message;
            } finally {
                this.loading = false;
            }
        },

        async loadChartData() {
            if (!this.selectedDeviceId || !this.startDate || !this.endDate) return;

            try {
                // Always start with monthly data
                const params = new URLSearchParams({
                    start_date: this.startDate,
                    end_date: this.endDate,
                    interval: 'month'
                });

                const response = await fetch(`/api/device-savings/${this.selectedDeviceId}/aggregated?${params}`);
                const data = await response.json();

                this.chartData = data.data;
                this.calculateSelectedRangeStats(this.chartData);
                this.updateChart();

            } catch (error) {
                this.error = 'Failed to load chart data: ' + error.message;
            }
        },

        calculateTotalStats(data) {
            this.totalStats = data.reduce((acc, item) => ({
                carbon_saved: acc.carbon_saved + item.carbon_saved,
                fuel_saved: acc.fuel_saved + item.fuel_saved
            }), { carbon_saved: 0, fuel_saved: 0 });
        },

        calculateMonthlyStats(data) {
            // Since the sample data is from 2023, let's calculate monthly average from the available data
            // Find the latest month in the data and calculate stats for that month
            if (data.length === 0) {
                this.monthlyStats = { carbon_saved: 0, fuel_saved: 0 };
                return;
            }

            // Sort data by timestamp to find the latest date
            const sortedData = [...data].sort((a, b) => new Date(b.device_timestamp) - new Date(a.device_timestamp));
            const latestDate = new Date(sortedData[0].device_timestamp);

            // Get data from the latest month
            const latestMonth = latestDate.getMonth();
            const latestYear = latestDate.getFullYear();

            const monthlyData = data.filter(item => {
                const itemDate = new Date(item.device_timestamp);
                return itemDate.getMonth() === latestMonth && itemDate.getFullYear() === latestYear;
            });

            this.monthlyStats = monthlyData.reduce((acc, item) => ({
                carbon_saved: acc.carbon_saved + item.carbon_saved,
                fuel_saved: acc.fuel_saved + item.fuel_saved
            }), { carbon_saved: 0, fuel_saved: 0 });
        },

        calculateSelectedRangeStats(data) {
            this.selectedRangeStats = data.reduce((acc, item) => ({
                carbon_saved: acc.carbon_saved + item.carbon_saved,
                fuel_saved: acc.fuel_saved + item.fuel_saved
            }), { carbon_saved: 0, fuel_saved: 0 });
        },

        initializeDates() {
            // Use dates from the actual data range (2023-2024)
            // Set to a range that has data
            const endDate = new Date('2024-01-31T23:59:59');
            const startDate = new Date('2023-12-01T00:00:00');

            this.endDate = this.formatDateForInput(endDate);
            this.startDate = this.formatDateForInput(startDate);
            this.activePreset = '60days';
        },

        setPreset(preset) {
            // Use dates from the actual data range (2023-2024)
            const dataEndDate = new Date('2024-01-31T23:59:59');
            let startDate;

            switch (preset) {
                case '30days':
                    startDate = new Date('2024-01-01T00:00:00');
                    break;
                case '60days':
                    startDate = new Date('2023-12-01T00:00:00');
                    break;
                case '1year':
                    startDate = new Date('2023-01-01T00:00:00');
                    break;
            }

            this.startDate = this.formatDateForInput(startDate);
            this.endDate = this.formatDateForInput(dataEndDate);
            this.activePreset = preset;

            this.loadChartData();
        },

        formatDateForInput(date) {
            // Format date without timezone conversion to preserve the intended date
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        },

        formatNumber(num, decimals = 1) {
            if (num === 0) return '0';
            if (num < 1) return num.toFixed(2);
            return num.toFixed(decimals);
        },

        updateChart() {
            this.$nextTick(() => {
                const chartElement = document.getElementById('chart');
                if (!chartElement) return;

                // Destroy previous chart instance completely
                if (this.chart) {
                    this.chart.dispose();
                    this.chart = null;
                }

                this.chart = echarts.init(chartElement);

                // Prepare chart data
                const dates = this.chartData.map(item => {
                    const date = new Date(item.timestamp);
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                    });
                });

                const carbonData = this.chartData.map(item => parseFloat((item.carbon_saved / 1000).toFixed(1)));
                const fuelData = this.chartData.map(item => parseFloat((item.fuel_saved / 1000).toFixed(1)));

                // Check if both data sets are all zeros or empty
                const allZero =
                    (!carbonData.length && !fuelData.length) ||
                    (carbonData.every(v => v === 0) && fuelData.every(v => v === 0));

                // If all values are zero — show a clear "no data" screen
                if (allZero) {
                    this.chart.clear();
                    this.chart.setOption({
                        title: {
                            text: 'No data available for this period',
                            left: 'center',
                            top: 'middle',
                            textStyle: {
                                color: '#888',
                                fontSize: 16,
                                fontStyle: 'italic'
                            }
                        }
                    });
                    return;
                }

                // Otherwise render normal chart
                const option = {
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['Carbon savings', 'Diesel savings'], bottom: 0 },
                    xAxis: { type: 'category', data: dates },
                    yAxis: [
                        { type: 'value', name: 'Tonnes' },
                        { type: 'value', name: 'k Litres' }
                    ],
                    series: [
                        {
                            name: 'Carbon savings',
                            type: 'bar',
                            yAxisIndex: 0,
                            data: carbonData,
                            itemStyle: { color: '#4ecdc4' },
                        },
                        {
                            name: 'Diesel savings',
                            type: 'bar',
                            yAxisIndex: 1,
                            data: fuelData,
                            itemStyle: { color: '#5b9bd5' },
                        }
                    ]
                };

                this.chart.setOption(option);
            });
        }

    }
}).mount('#app');