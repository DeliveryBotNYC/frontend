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
  const series = [
    {
      name: "",
      data: item.chart,
    },
  ];

  const options2 = {
    series: series,
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
    },
    dataLabels: {
      enabled: false,
    },
    colors: ["#676767"],
    stroke: {
      curve: "smooth",
      colors: ["#676767"],
    },
    xaxis: {
      labels: {
        show: false,
      },
      grid: {
        show: false,
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      show: false,
      grid: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    legend: {
      horizontalAlign: "left",
      marker: {
        fillColors: ["#676767"],
      },
    },
    tooltip: {
      theme: "dark",
      x: {
        show: false,
      },
      custom: function ({
        seriesIndex,
        dataPointIndex,
        w,
      }: CustomFunctionParams) {
        const bgColor = "#676767"; // Set your custom background color
        return `<div style="background-color: ${bgColor}; color: white; padding: 10px; border-radius: 5px;">${w.globals.series[seriesIndex][dataPointIndex]}</div>`;
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.0,
        opacityTo: 0.0,
        stops: item.chart,
      },
    },
  };

  return (
    <div className="overflow-hidden">
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
