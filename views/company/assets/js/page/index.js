"use strict";

var chart3Instance = null;
var chart4Instance = null;

$(function () {
    // Initial data load
    chart3();
    chart4();
    revenueData();

    // Event listeners for year selection
    $("#revenueBranchYearSelect").on("change", function () {
        chart4($(this).val());
    });

    $("#paymentMethodYearSelect").on("change", function () {
        chart3($(this).val());
    });

    // select all on checkbox click
    $("[data-checkboxes]").each(function () {
        var me = $(this), group = me.data('checkboxes'), role = me.data('checkbox-role');

        me.change(function () {
            var all = $('[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"])'),
                checked = $('[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"]):checked'),
                dad = $('[data-checkboxes="' + group + '"][data-checkbox-role="dad"]'), total = all.length,
                checked_length = checked.length;

            if (role == 'dad') {
                if (me.is(':checked')) {
                    all.prop('checked', true);
                } else {
                    all.prop('checked', false);
                }
            } else {
                if (checked_length >= total) {
                    dad.prop('checked', true);
                } else {
                    dad.prop('checked', false);
                }
            }
        });
    });
});

async function chart3(year = new Date().getFullYear()) {
    try {
        const response = await fetch(`/company/paymentMode?year=${year}`);
        const data = await response.json();
        const result = data.paymentMode;

        if (chart3Instance) {
            chart3Instance.destroy();
            chart3Instance = null;
        }

        const container = document.querySelector("#chart3");
        if (!container) return;

        if (result && result.length > 0) {
            var options = {
                chart: {
                    height: 250,
                    type: 'line',
                    toolbar: { show: false },
                    zoom: { enabled: false }
                },
                colors: ["#786BED", "#4CC2B0", "#F97316", "#999b9c"],
                dataLabels: { enabled: false },
                stroke: { width: 3, curve: 'smooth' },
                series: result.map(mode => ({ name: mode.name, data: mode.data })),
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    labels: { style: { colors: "#9aa0ac" } }
                },
                yaxis: {
                    labels: { style: { color: "#9aa0ac" } },
                    min: 0,
                    forceNiceScale: true
                },
                grid: { borderColor: '#f1f1f1' },
                title: {
                    text: 'Monthly Payment Method Distribution',
                    align: 'center'
                },
                legend: { position: 'top', horizontalAlign: 'right' }
            }

            container.innerHTML = "";
            chart3Instance = new ApexCharts(container, options);
            chart3Instance.render();
        } else {
            container.innerHTML = "<div class='text-center p-4'>No Data Available</div>";
        }
    } catch (error) {
        console.error('Error fetching payment mode data:', error);
    }
}

async function chart4(year = new Date().getFullYear()) {
    try {
        const response = await fetch(`/company/allBranchesRevenue?year=${year}`);
        const data = await response.json();
        const result = data.monthWiseTotals;

        if (chart4Instance) {
            chart4Instance.destroy();
            chart4Instance = null;
        }

        const container = document.querySelector("#chart4");
        if (!container) return;

        if (result && result.length > 0) {
            var options = {
                chart: {
                    height: 250,
                    type: 'area',
                    toolbar: { show: false }
                },
                colors: ['#786BED', '#4CC2B0', '#f5ce42', '#fd7e14', '#5cb85c', '#d9534f', '#5bc0de', '#777777'],
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.3,
                        stops: [0, 90, 100]
                    }
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 2 },
                series: result.map(branch => ({ name: branch.name, data: branch.data })),
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                    labels: { style: { colors: "#9aa0ac" } }
                },
                yaxis: {
                    labels: { style: { color: "#9aa0ac" } },
                    min: 0,
                    forceNiceScale: true
                },
                title: {
                    text: 'Monthly Revenue Comparison by Branch',
                    align: 'center'
                },
                legend: { position: 'top', horizontalAlign: 'right' }
            };

            container.innerHTML = "";
            chart4Instance = new ApexCharts(container, options);
            chart4Instance.render();
        } else {
            container.innerHTML = "<div class='text-center p-4'>No Data Available</div>";
        }
    } catch (error) {
        console.error('Error fetching branch revenue data:', error);
    }
}

async function revenueData() {
    const periods = ['today', 'currentWeek', 'currentMonth', 'currentYear'];
    
    periods.forEach(period => {
        fetch(`/company/${period}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update revenue value
                    document.getElementById(period).textContent = data.revenueData.toLocaleString();
                    
                    // Update percentage and status
                    const percEl = document.getElementById(`${period}-perc`);
                    const statusEl = document.getElementById(`${period}-status`);
                    
                    if (percEl && statusEl) {
                        percEl.textContent = `${data.percentageChange}%`;
                        statusEl.textContent = data.status;
                        
                        // Set colors
                        if (data.status === "Increase") {
                            percEl.className = 'col-green';
                        } else {
                            percEl.className = 'col-orange';
                        }
                    }
                }
            })
            .catch(error => console.error(`Error fetching ${period} revenue:`, error));
    });
}