/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactApexChart from "react-apexcharts";

interface CustomFunctionParams {
  seriesIndex: number;
  dataPointIndex: number;
  w: {
    globals: {
      series: any[][];
    };
  };
}

const DashboardAreaChart = ({ item }) => {
  // Transform the chart data to extract just the numbers
  const chartData = item.chart?.map((point: any) => point.orders) || [];
  const chartLabels = item.chart?.map((point: any) => point.date) || [];

  // Determine the range type based on date format
  const getRangeType = () => {
    if (chartLabels.length === 0) return "day";
    const firstLabel = chartLabels[0];
    if (firstLabel.length === 4) return "year"; // YYYY
    if (firstLabel.length === 7) return "month"; // YYYY-MM
    return "day"; // YYYY-MM-DD
  };

  const rangeType = getRangeType();

  const series = [
    {
      name: "Orders",
      data: chartData,
    },
  ];

  const options2 = {
    chart: {
      type: "area",
      height: 350,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
      background: "transparent",
      sparkline: {
        enabled: true, // Removes all axes and labels for a clean mini chart
      },
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#676767"],
    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#676767"],
    },
    xaxis: {
      categories: chartLabels,
      labels: {
        show: false,
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
      tooltip: {
        enabled: false, // Disable x-axis tooltip
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    legend: {
      show: false, // Hide legend for cleaner look
    },
    tooltip: {
      enabled: true,
      shared: false, // Only show one tooltip
      followCursor: true,
      intersect: false,
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
      z: {
        index: 9999, // High z-index to appear above other components
      },
      custom: function ({
        seriesIndex,
        dataPointIndex,
        w,
      }: CustomFunctionParams) {
        const orders = w.globals.series[seriesIndex][dataPointIndex];
        const date = chartLabels[dataPointIndex];

        // Format date based on range type
        let formattedDate;
        if (rangeType === "year") {
          formattedDate = date; // Just show the year (e.g., "2024")
        } else if (rangeType === "month") {
          // Convert YYYY-MM to "Jan 2024" format
          const dateObj = new Date(date + "-01");
          formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
        } else {
          // Day format - "Jan 5, 2024" or "Jan 5" for current year
          const dateObj = new Date(date);
          const currentYear = new Date().getFullYear();
          formattedDate = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: dateObj.getFullYear() !== currentYear ? "numeric" : undefined,
          });
        }

        return `<div style="
          background: linear-gradient(135deg, #333 0%, #555 100%);
          color: white; 
          padding: 8px 12px; 
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 1px solid #666;
          font-size: 12px;
          line-height: 1.4;
          z-index: 9999;
          position: relative;
        ">
          <div style="font-weight: 600; margin-bottom: 2px;">${formattedDate}</div>
          <div style="color: #ccc;">${orders} order${
          orders !== 1 ? "s" : ""
        }</div>
        </div>`;
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#676767",
            opacity: 0.4,
          },
          {
            offset: 100,
            color: "#676767",
            opacity: 0.05,
          },
        ],
      },
    },
    markers: {
      size: 0, // Hide markers by default
      hover: {
        size: 4, // Show small marker on hover
        sizeOffset: 2,
      },
      colors: ["#676767"],
      strokeColors: "#fff",
      strokeWidth: 2,
    },
  };

  return (
    <div className="relative">
      <ReactApexChart
        options={options2 as any}
        series={series}
        type="area"
        height={60}
      />
    </div>
  );
};

export default DashboardAreaChart;
