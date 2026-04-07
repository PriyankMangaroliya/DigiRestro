var revenueChartInstance = null;
var growthChartInstance = null;
var yearlyChartInstance = null;

$(function () {
  if (document.querySelector("#chart1")) chart1();
  if (document.querySelector("#chart2")) chart2();
  if (document.querySelector("#growthChart")) growthChart();
  if (document.querySelector("#chart4")) chart4();

  $("#revenueYearSelect").on("change", function () {
    const selectedYear = $(this).val();
    chart1(selectedYear);
  });

  $("#growthYearSelect").on("change", function () {
    const selectedYear = $(this).val();
    growthChart(selectedYear);
  });

  // select all on checkbox click
  $("[data-checkboxes]").each(function () {
    var me = $(this),
      group = me.data("checkboxes"),
      role = me.data("checkbox-role");

    me.change(function () {
      var all = $(
        '[data-checkboxes="' + group + '"]:not([data-checkbox-role="dad"])'
      ),
        checked = $(
          '[data-checkboxes="' +
          group +
          '"]:not([data-checkbox-role="dad"]):checked'
        ),
        dad = $('[data-checkboxes="' + group + '"][data-checkbox-role="dad"]'),
        total = all.length,
        checked_length = checked.length;

      if (role == "dad") {
        if (me.is(":checked")) {
          all.prop("checked", true);
        } else {
          all.prop("checked", false);
        }
      } else {
        if (checked_length >= total) {
          dad.prop("checked", true);
        } else {
          dad.prop("checked", false);
        }
      }
    });
  });
});

async function chart1(year = new Date().getFullYear()) {
  try {
    const response = await fetch(`/admin/revenue-chart?year=${year}`);
    const data = await response.json();
    console.log("Revenue Chart Data:", data);
    const result = data.revenueData || [];

    if (revenueChartInstance) {
      try {
        revenueChartInstance.destroy();
      } catch (e) {
        console.warn("ApexCharts destroy error:", e);
      }
      revenueChartInstance = null;
    }

    const container = document.querySelector("#chart1");
    if (!container) return;

    const seriesData = [
      {
        name: "Total Revenue",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthData = result.find((item) => item.month === i + 1);
          return monthData ? monthData.totalPrice : 0;
        }),
      },
    ];

    var options = {
      chart: {
        height: 230,
        type: "line",
        shadow: {
          enabled: true,
          color: "#000",
          top: 18,
          left: 7,
          blur: 10,
          opacity: 1,
        },
        toolbar: {
          show: false,
        },
      },
      title: {
        text: 'Monthly Revenue',
        align: 'center'
      },
      colors: ["#786BED"],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'right'
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      series: seriesData,
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        title: {
          text: "Months",
        },
        labels: {
          style: {
            colors: "#9aa0ac",
          },
        },
      },
      yaxis: {
        title: {
          text: "Revenue",
        },
        labels: {
          style: {
            color: "#9aa0ac",
          },
        },
        min: 0,
        forceNiceScale: true,
      },
      grid: {
        borderColor: "#e7e7e7",
        padding: {
          left: 10,
          right: 10,
        },
      },
    };

    container.innerHTML = "";
    revenueChartInstance = new ApexCharts(container, options);
    revenueChartInstance.render();
  } catch (error) {
    console.error("Error fetching revenue data:", error);
  }
}

// async function chart1() {
//   try {
//     const response = await fetch("/admin/revenue-chart");
//     const data = await response.json();
//     const result = data.revenueData;
//     console.log(result);
//     if (result.length > 0) {
//       //   const seriesData = result.map((entry) => {
//       //     return {
//       //       name: "Total Revenue", // Name of the series
//       //       data: Array.from({ length: 12 }, (_, i) => {
//       //         const monthData = result.find((item) => item.month === i + 1);
//       //         return monthData ? monthData.totalPrice : 0;
//       //       }),
//       //     };
//       //   });
//       const seriesData = result.map((entry) => {
//         return {
//           name: `Total revenue of ${entry.year}`,
//           data: Array.from({ length: 12 }, (_, i) => {
//             const monthData = result.find((item) => item.month === i + 1);
//             return monthData ? monthData.totalPrice : 0;
//           }),
//         };
//       });
//       var options = {
//         chart: {
//           height: 230,
//           type: "line",
//           shadow: {
//             enabled: true,
//             color: "#000",
//             top: 18,
//             left: 7,
//             blur: 10,
//             opacity: 1,
//           },
//           toolbar: {
//             show: false,
//           },
//         },
//         colors: ["#786BED"],
//         dataLabels: {
//           enabled: true,
//         },
//         stroke: {
//           curve: "smooth",
//         },
//         series: seriesData,
//         grid: {
//           borderColor: "#e7e7e7",
//           row: {
//             colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
//             opacity: 0.0,
//           },
//         },
//         markers: {
//           size: 6,
//         },
//         xaxis: {
//           categories: [
//             "Jan",
//             "Feb",
//             "Mar",
//             "Apr",
//             "May",
//             "Jun",
//             "July",
//             "Aug",
//             "Sep",
//             "Oct",
//             "Nov",
//             "Dec",
//           ],

//           labels: {
//             style: {
//               colors: "#9aa0ac",
//             },
//           },
//         },
//         yaxis: {
//           title: {
//             text: "Income",
//           },
//           labels: {
//             style: {
//               color: "#9aa0ac",
//             },
//           },
//           min: 0,
//           max: 2000000,
//         },
//         legend: {
//           position: "top",
//           horizontalAlign: "right",
//           floating: true,
//           offsetY: -25,
//           offsetX: -5,
//         },
//       };

//       var chart = new ApexCharts(document.querySelector("#chart1"), options);

//       chart.render();
//     } else {
//       document.querySelector("#chart1").innerHTML = "No Data Available";
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }
// function chart1() {
//     var options = {
//         chart: {
//             height: 230,
//             type: "line",
//             shadow: {
//                 enabled: true,
//                 color: "#000",
//                 top: 18,
//                 left: 7,
//                 blur: 10,
//                 opacity: 1
//             },
//             toolbar: {
//                 show: false
//             }
//         },
//         colors: ["#786BED", "#999b9c"],
//         dataLabels: {
//             enabled: true
//         },
//         stroke: {
//             curve: "smooth"
//         },
//         series: [{
//             name: "2019",
//             data: [5, 175, 14, 36, 132, 132]
//         },
//         {
//             name: "2018",
//             data: [7, 11, 30, 18, 125, 113]
//         }
//         ],
//         grid: {
//             borderColor: "#e7e7e7",
//             row: {
//                 colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
//                 opacity: 0.0
//             }
//         },
//         markers: {
//             size: 6
//         },
//         xaxis: {
//             categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

//             labels: {
//                 style: {
//                     colors: "#9aa0ac"
//                 }
//             }
//         },
//         yaxis: {
//             title: {
//                 text: "Income"
//             },
//             labels: {
//                 style: {
//                     color: "#9aa0ac"
//                 }
//             },
//             min: 0,
//             max: 200
//         },
//         legend: {
//             position: "top",
//             horizontalAlign: "right",
//             floating: true,
//             offsetY: -25,
//             offsetX: -5
//         }
//     };

//     var chart = new ApexCharts(document.querySelector("#chart1"), options);

//     chart.render();
// }

function chart2() {
  var options = {
    chart: {
      height: 250,
      type: "bar",
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "200px",
      },
    },
    series: [
      {
        name: "PRODUCT A",
        data: [44, 55, 41, 67, 22, 43],
      },
      {
        name: "PRODUCT B",
        data: [13, 23, 20, 8, 13, 27],
      },
      {
        name: "PRODUCT C",
        data: [11, 17, 15, 15, 21, 14],
      },
    ],
    xaxis: {
      type: "datetime",
      categories: [
        "01/01/2019 GMT",
        "01/02/2019 GMT",
        "01/03/2019 GMT",
        "01/04/2019 GMT",
        "01/05/2019 GMT",
        "01/06/2019 GMT",
      ],
      title: {
        text: "Date",
      },
      labels: {
        style: {
          colors: "#9aa0ac",
        },
      },
    },
    grid: {
      padding: {
        left: 10,
        right: 10,
      },
    },
    yaxis: {
      title: {
        text: "Product Count",
      },
      labels: {
        style: {
          color: "#9aa0ac",
        },
      },
      min: 0,
      max: function (max) {
        return max > 0 ? max * 1.2 : 100;
      },
      forceNiceScale: true,
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right'
    },
    fill: {
      opacity: 1,
    },
  };

  const container = document.querySelector("#chart2");
  if (!container) return;

  var chart = new ApexCharts(container, options);
  chart.render();
}


async function growthChart(year = new Date().getFullYear()) {
  try {
    const response = await fetch(`/admin/growth-chart?year=${year}`);
    const data = await response.json();
    console.log("Growth Chart Data:", data);
    const result = data.growthData || { clients: [], companies: [], branches: [] };

    if (growthChartInstance) {
      try {
        growthChartInstance.destroy();
      } catch (e) {
        console.warn("Growth chart destroy error:", e);
      }
      growthChartInstance = null;
    }

    const container = document.querySelector("#growthChart");
    if (!container) return;

    const seriesData = [
      {
        name: "Clients",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthData = result.clients.find((item) => item.month === i + 1);
          return monthData ? monthData.count : 0;
        }),
      },
      {
        name: "Companies",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthData = result.companies.find((item) => item.month === i + 1);
          return monthData ? monthData.count : 0;
        }),
      },
      {
        name: "Branches",
        data: Array.from({ length: 12 }, (_, i) => {
          const monthData = result.branches.find((item) => item.month === i + 1);
          return monthData ? monthData.count : 0;
        }),
      },
    ];

    var options = {
      chart: {
        height: 250,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      title: {
        text: 'Monthly Growth',
        align: 'center'
      },
      colors: ["#786BED", "#4CC2B0", "#F97316"],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right'
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      series: seriesData,
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "July",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        title: {
          text: "Months",
        },
        labels: {
          style: {
            colors: "#9aa0ac",
          },
        },
      },
      grid: {
        padding: {
          left: 10,
          right: 10,
        },
      },
      yaxis: {
        title: {
          text: "Count",
        },
        labels: {
          style: {
            color: "#9aa0ac",
          },
        },
        min: 0,
        max: function (max) {
          return max > 0 ? max * 1.5 : 10;
        },
        forceNiceScale: true,
      },
    };

    container.innerHTML = "";
    growthChartInstance = new ApexCharts(container, options);
    growthChartInstance.render();
  } catch (error) {
    console.error("Error fetching growth data:", error);
  }
}

async function chart4() {
  try {
    const response = await fetch("/admin/yearly-revenue-chart");
    const data = await response.json();
    console.log("Yearly Revenue Chart Data:", data);
    const result = data.yearlyRevenueData || [];

    const currentYear = new Date().getFullYear();
    const yearsToShow = [currentYear - 2, currentYear - 1, currentYear];

    const seriesData = [{
      name: "Total Revenue",
      data: yearsToShow.map(year => {
        const yearData = result.find(entry => entry.year === year);
        return yearData ? yearData.totalPrice : 0;
      })
    }];

    var options = {
      chart: {
        height: 250,
        type: "line",
        toolbar: {
          show: false,
        },
      },
      title: {
        text: 'Yearly Revenue',
        align: 'center'
      },
      colors: ["#4CC2B0"], // line color
      fill: {
        colors: ["#4CC2B0"], // fill color
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'right'
      },
      stroke: {
        curve: "smooth",
      },
      markers: {
        colors: ["#4CC2B0"], // marker color
        size: 6,
      },
      series: seriesData, // Assign series data
      xaxis: {
        categories: yearsToShow.map(String), // Use last 3 years as x-axis categories
        labels: {
          style: {
            colors: "#9aa0ac",
          },
        },
        title: {
          text: "Year",
        },
      },
      grid: {
        padding: {
          left: 10,
          right: 10,
        },
      },
      yaxis: {
        title: {
          text: "Total Revenue",
        },
        labels: {
          style: {
            color: "#9aa0ac",
          },
        },
        min: 0,
        max: function (max) {
          return max > 0 ? max * 1.2 : 1000;
        },
        forceNiceScale: true,
      },
    };

    const container = document.querySelector("#chart4");
    if (container) {
      container.innerHTML = "";
      yearlyChartInstance = new ApexCharts(container, options);
      yearlyChartInstance.render();
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


// async function chart4() {
//   try {
//     const response = await fetch("/admin/yearly-revenue-chart");
//     const data = await response.json();
//     const result = data.yearlyRevenueData;
//     console.log(result);

//     if (result.length > 0) {
//       const seriesData = result.map((entry) => {
//         return {
//           name: `Total revenue of ${entry.year}`,
//           data: [entry.totalPrice, entry.year], // Modified to include totalPrice directly
//         };
//       });
//       console.log("Series: ", seriesData);

//       var options = {
//         chart: {
//           height: 250,
//           type: "area",
//           toolbar: {
//             show: false,
//           },
//         },
//         colors: ["#4CC2B0"], // line color
//         fill: {
//           colors: ["#4CC2B0"], // fill color
//         },
//         dataLabels: {
//           enabled: false,
//         },
//         stroke: {
//           curve: "smooth",
//         },
//         markers: {
//           colors: ["#4CC2B0"], // marker color
//         },
//         series: seriesData, // Assign series data
//         legend: {
//           show: false,
//         },
//         xaxis: {
//           // categories: result.map(entry => entry.year), // Use years as x-axis categories
//           categories: result.map((entry) => ({ year: entry.year })),

//           labels: {
//             style: {
//               colors: "#9aa0ac",
//             },
//           },
//         },
//         yaxis: {
//           labels: {
//             style: {
//               color: "#9aa0ac",
//             },
//           },
//           min: 0,
//           max: 2000000,
//         },
//       };

//       var chart = new ApexCharts(document.querySelector("#chart4"), options);

//       chart.render();
//     } else {
//       document.querySelector("#chart1").innerHTML = "No Data Available";
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

// async function chart4() {
//   try {
//     const response = await fetch("/admin/yearly-revenue-chart");
//     const data = await response.json();
//     const result = data.yearlyRevenueData;
//     console.log(result);

//     if (result.length > 0) {
//       const seriesData = result.map(item => ({

//         name: `Total revenue of ${item.year}`,
//         data: [item.totalPrice]
//       }));

//       var options = {
//         chart: {
//           height: 250,
//           type: "area",
//           toolbar: {
//             show: false,
//           },
//         },
//         colors: ["#4CC2B0"], // line color
//         fill: {
//           colors: ["#4CC2B0"], // fill color
//         },
//         dataLabels: {
//           enabled: false,
//         },
//         stroke: {
//           curve: "smooth",
//         },
//         markers: {
//           colors: ["#4CC2B0"], // marker color
//         },
//         series: seriesData,
//         legend: {
//           show: false,
//         },
//         xaxis: {
//           categories: result.map(item => item.year.toString()), // Adjusted x-axis to display only the year
//           labels: {
//             style: {
//               colors: "#9aa0ac",
//             },
//           },
//         },
//         yaxis: {
//           labels: {
//             style: {
//               color: "#9aa0ac",
//             },
//           },
//         },
//       };

//       var chart = new ApexCharts(document.querySelector("#chart4"), options);

//       chart.render();
//     } else {
//       document.querySelector("#chart4").innerHTML = "No Data Available";
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

// async function chart4() {
//   try {
//     const response = await fetch("/admin/yearly-revenue-chart");
//     const data = await response.json();
//     const result = data.yearlyRevenueData;
//     console.log(result);

//     if (result.length > 0) {
//       const seriesData = [{
//         name: `Total revenue of ${result[0].year}`,
//         data: [result[0].totalPrice] // Adjusted to only include total revenue for the whole year
//       }];

//       var options = {
//         chart: {
//           height: 250,
//           type: "area",
//           toolbar: {
//             show: false,
//           },
//         },
//         colors: ["#4CC2B0"], // line color
//         fill: {
//           colors: ["#4CC2B0"], // fill color
//         },
//         dataLabels: {
//           enabled: false,
//         },
//         stroke: {
//           curve: "smooth",
//         },
//         markers: {
//           colors: ["#4CC2B0"], // marker color
//         },
//         series: seriesData,
//         legend: {
//           show: false,
//         },
//         xaxis: {
//           categories: [result[0].year.toString()], // Adjusted x-axis to display only the year
//           labels: {
//             style: {
//               colors: "#9aa0ac",
//             },
//           },
//         },
//         yaxis: {
//           labels: {
//             style: {
//               color: "#9aa0ac",
//             },
//           },
//         },
//       };

//       var chart = new ApexCharts(document.querySelector("#chart4"), options);

//       chart.render();
//     } else {
//       document.querySelector("#chart4").innerHTML = "No Data Available";
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

// async function chart4() {
//   try {
//     const response = await fetch("/admin/yearly-revenue-chart");
//     const data = await response.json();
//     const result = data.yearlyRevenueData;
//     console.log(result);

//     if (result.length > 0) {
//       const seriesData = [{
//         name: `Total revenue of ${result[0].year}`,
//         data: result.map(entry => entry.totalPrice)
//       }];

//       var options = {
//         chart: {
//           height: 250,
//           type: "area",
//           toolbar: {
//             show: false,
//           },
//         },
//         colors: ["#4CC2B0"], // line color
//         fill: {
//           colors: ["#4CC2B0"], // fill color
//         },
//         dataLabels: {
//           enabled: false,
//         },
//         stroke: {
//           curve: "smooth",
//         },
//         markers: {
//           colors: ["#4CC2B0"], // marker color
//         },
//         series: seriesData,
//         legend: {
//           show: false,
//         },
//         xaxis: {
//           categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July"],
//           labels: {
//             style: {
//               colors: "#9aa0ac",
//             },
//           },
//         },
//         yaxis: {
//           labels: {
//             style: {
//               color: "#9aa0ac",
//             },
//           },
//         },
//       };

//       var chart = new ApexCharts(document.querySelector("#chart4"), options);

//       chart.render();
//     } else {
//       document.querySelector("#chart4").innerHTML = "No Data Available";
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

// async function chart4() {
//   try {
//     const response = await fetch("/admin/yearly-revenue-chart");
//     const data = await response.json();
//     var result = data.yearlyRevenueData;
//     console.log(result);
//     // result[1]['totalPrice'] = "0";
//     // result[1]['year'] = "2023";

//     if (result.length > 0) {
//       // const seriesData = result.map((entry) => {
//       //   return {
//       //     name: `Total revenue of ${entry.year}`,
//       //     data: Array.from({ length: 12 }, (_, i) => {
//       //       const monthData = result.find((item) => item.month === i + 1);
//       //       return monthData ? monthData.totalPrice : 0;
//       //     }),
//       //   };
//       // });
//       var options = {
//         chart: {
//           height: 250,
//           type: "area",
//           toolbar: {
//             show: false,
//           },
//         },
//         colors: [ "#4CC2B0"], // line color
//         fill: {
//           colors: [ "#4CC2B0"], // fill color
//         },
//         dataLabels: {
//           enabled: false,
//         },
//         stroke: {
//           curve: "smooth",
//         },
//         markers: {
//           colors: ["#4CC2B0" ], // marker color
//         },
//         series: [
//           {
//             name: result[0]['year'],
//             data: result[0]['totalPrice']
//           }
//         ],
//         legend: {
//           show: false,
//         },
//         xaxis: {
//           categories: [2024],
//           labels: {
//             style: {
//               colors: "#9aa0ac",
//             },
//           },
//         },
//         yaxis: {
//           labels: {
//             style: {
//               color: "#9aa0ac",
//             },
//           },
//         },
//       };

//       var chart = new ApexCharts(document.querySelector("#chart4"), options);

//       chart.render();
//     } else {
//       document.querySelector("#chart1").innerHTML = "No Data Available";
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }
