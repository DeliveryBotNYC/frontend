import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useConfig, url } from "../hooks/useConfig";
import ContentBox from "../components/reusable/ContentBox";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DriverEarning {
  driver_id: number;
  driver_name: string;
  orders_completed: number;
  base_pay: number;
  tips: number;
  bonuses: number;
  total_earnings: number;
  status: "paid" | "pending" | "processing";
}

interface EarningsSummary {
  period: string;
  total_revenue: number;
  total_driver_payouts: number;
  total_tips: number;
  net_profit: number;
  orders_count: number;
  avg_order_value: number;
  profit_margin: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  driver_cost: number;
  profit: number;
}

interface FullEarningsResponse {
  summary: EarningsSummary;
  daily: DailyRevenue[];
  drivers: DriverEarning[];
}

interface DriverDetailRoute {
  route_id: number;
  date: string;
  time_frame: string;
  orders_delivered: number;
  base_pay: number;
  tips: number | null;
  tips_pending: boolean;
  total: number | null;
}

interface DriverDetail {
  driver_id: number;
  period: string;
  routes: DriverDetailRoute[];
  totals: {
    base_pay: number;
    tips: number;
    total: number;
    per_order: number;
  };
}

// ─── Period mapping ───────────────────────────────────────────────────────────

const PERIODS = ["This Week", "Last Week", "This Month", "Last Month"] as const;
type Period = (typeof PERIODS)[number];

const PERIOD_API_MAP: Record<Period, string> = {
  "This Week": "this_week",
  "Last Week": "last_week",
  "This Month": "this_month",
  "Last Month": "last_month",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );

function exportDriversCsv(drivers: DriverEarning[], period: string) {
  const header = [
    "Driver",
    "Orders",
    "Base Pay",
    "Tips",
    "Bonuses",
    "Total",
    "Status",
  ];
  const rows = drivers.map((d) => [
    d.driver_name,
    d.orders_completed,
    d.base_pay.toFixed(2),
    d.tips.toFixed(2),
    d.bonuses.toFixed(2),
    d.total_earnings.toFixed(2),
    d.status,
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `driver-earnings-${period.toLowerCase().replace(/ /g, "-")}.csv`;
  a.click();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  loading?: boolean;
  icon: React.ReactNode;
}

const MetricCard = ({
  label,
  value,
  sub,
  accent,
  loading,
  icon,
}: MetricCardProps) => (
  <div
    className={`rounded-lg p-4 flex flex-col gap-3 border ${
      accent ? "bg-themeOrange border-themeOrange" : "bg-white border-contentBg"
    }`}
  >
    <div className="flex items-center justify-between">
      <span
        className={`text-xs font-medium uppercase tracking-wide ${
          accent ? "text-white/80" : "text-themeDarkGray"
        }`}
      >
        {label}
      </span>
      <span className={accent ? "text-white/70" : "text-themeOrange"}>
        {icon}
      </span>
    </div>
    <div>
      {loading ? (
        <div
          className={`h-7 w-28 rounded animate-pulse ${
            accent ? "bg-white/20" : "bg-contentBg"
          }`}
        />
      ) : (
        <p
          className={`text-2xl font-bold ${
            accent ? "text-white" : "text-themeLightBlack"
          }`}
        >
          {value}
        </p>
      )}
      {sub && !loading && (
        <p
          className={`text-xs mt-0.5 ${
            accent ? "text-white/70" : "text-themeDarkGray"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: DriverEarning["status"] }) => {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const StackedChart = ({
  data,
  loading,
}: {
  data: DailyRevenue[];
  loading?: boolean;
}) => {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const H = 120;

  if (loading) {
    return (
      <div className="flex items-end gap-1.5 w-full" style={{ height: H + 24 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded bg-contentBg animate-pulse"
              style={{ height: `${40 + ((i * 11) % 60)}px` }}
            />
            <div className="h-2 w-4 rounded bg-contentBg animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5 w-full" style={{ height: H + 24 }}>
      {data.map((d) => {
        const totalH = (d.revenue / max) * H;
        const profitH = (d.profit / max) * H;
        const costH = totalH - profitH;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full flex flex-col justify-end rounded overflow-hidden"
              style={{ height: H }}
            >
              <div
                style={{ height: profitH }}
                className="w-full bg-themeOrange/80 transition-all duration-500"
              />
              <div
                style={{ height: costH }}
                className="w-full bg-contentBg transition-all duration-500"
              />
            </div>
            <span className="text-[10px] text-themeDarkGray">{d.date}</span>
          </div>
        );
      })}
    </div>
  );
};

const TableSkeletonRow = () => (
  <tr className="border-b border-contentBg">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-contentBg rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

// ─── Driver detail panel (fetches on expand) ──────────────────────────────────

const DriverDetailPanel = ({
  driver,
  apiPeriod,
}: {
  driver: DriverEarning;
  apiPeriod: string;
}) => {
  const config = useConfig();

  const { data, isLoading } = useQuery<DriverDetail>({
    queryKey: ["driver_earnings_detail", driver.driver_id, apiPeriod],
    queryFn: () =>
      axios
        .get(
          `${url}/admin/v1/earnings/drivers/${driver.driver_id}?period=${apiPeriod}`,
          config,
        )
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="border-t border-contentBg bg-orange-50/50 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-themeLightBlack">
          {driver.driver_name} — Earnings Detail
        </h3>
        <StatusBadge status={driver.status} />
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {[
          {
            label: "Per Delivery Rate",
            value:
              driver.orders_completed > 0
                ? fmt(driver.base_pay / driver.orders_completed)
                : "–",
          },
          {
            label: "Avg Tip per Order",
            value:
              driver.orders_completed > 0
                ? fmt(driver.tips / driver.orders_completed)
                : "–",
          },
          {
            label: "Earnings / Order",
            value:
              driver.orders_completed > 0
                ? fmt(driver.total_earnings / driver.orders_completed)
                : "–",
          },
          { label: "Total Earnings", value: fmt(driver.total_earnings) },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-md border border-contentBg p-3"
          >
            <p className="text-xs text-themeDarkGray">{item.label}</p>
            <p className="text-base font-bold text-themeLightBlack mt-0.5">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Per-route table */}
      {isLoading ? (
        <div className="space-y-1.5 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-8 bg-contentBg rounded animate-pulse" />
          ))}
        </div>
      ) : data?.routes && data.routes.length > 0 ? (
        <div className="bg-white rounded-md border border-contentBg overflow-hidden mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-contentBg/40">
                {[
                  "Date",
                  "Timeframe",
                  "Deliveries",
                  "Base Pay",
                  "Tips",
                  "Total",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`text-themeDarkGray font-medium px-3 py-2 ${
                      i < 2
                        ? "text-left"
                        : i === 2
                          ? "text-center"
                          : "text-right"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.routes.map((r) => (
                <tr key={r.route_id} className="border-t border-contentBg">
                  <td className="px-3 py-2 text-themeLightBlack font-medium">
                    {r.date}
                  </td>
                  <td className="px-3 py-2 text-themeDarkGray">
                    {r.time_frame}
                  </td>
                  <td className="px-3 py-2 text-center text-themeLightBlack">
                    {r.orders_delivered}
                  </td>
                  <td className="px-3 py-2 text-right text-themeLightBlack">
                    {fmt(r.base_pay)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {r.tips_pending ? (
                      <span className="text-themeDarkGray italic">Pending</span>
                    ) : (
                      <span className="text-themeLightBlack">
                        {fmt(r.tips ?? 0)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-themeLightBlack">
                    {r.tips_pending ? (
                      <span className="text-themeDarkGray italic">–</span>
                    ) : (
                      fmt(r.total ?? 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {data.totals && (
              <tfoot>
                <tr className="bg-contentBg/40 border-t border-contentBg">
                  <td
                    colSpan={3}
                    className="px-3 py-2 text-xs font-bold text-themeLightBlack"
                  >
                    Totals
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-themeLightBlack">
                    {fmt(data.totals.base_pay)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-themeLightBlack">
                    {fmt(data.totals.tips)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-bold text-themeOrange">
                    {fmt(data.totals.total)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      ) : (
        <p className="text-xs text-themeDarkGray mb-3">
          No route data available for this period.
        </p>
      )}

      <div className="flex gap-2">
        <button className="text-xs bg-themeOrange text-white px-3 py-1.5 rounded-[30px] font-medium hover:opacity-90 transition-opacity">
          Mark as Paid
        </button>
        <button className="text-xs border border-contentBg text-themeLightBlack px-3 py-1.5 rounded-[30px] font-medium hover:bg-contentBg transition-colors">
          View Orders
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EarningsPage = () => {
  const config = useConfig();
  const [period, setPeriod] = useState<Period>("This Week");
  const [activeDriverId, setActiveDriverId] = useState<number | null>(null);

  const apiPeriod = PERIOD_API_MAP[period];

  const {
    data: earningsData,
    isLoading,
    isError,
    refetch,
  } = useQuery<FullEarningsResponse>({
    queryKey: ["admin_earnings", apiPeriod],
    queryFn: () =>
      axios
        .get(`${url}/admin/v1/earnings?period=${apiPeriod}`, config)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  });

  const summary = earningsData?.summary;
  const drivers = earningsData?.drivers ?? [];
  const daily = earningsData?.daily ?? [];

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    setActiveDriverId(null);
  };

  return (
    <div className="w-full">
      <PrimaryNav title="Earnings" />

      <div className="bg-themeOrange">
        <Sidebar />
        <ContentBox>
          <div className="h-full flex flex-col gap-4 overflow-y-auto">
            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-bold text-themeLightBlack">
                  Earnings & Revenue
                </h1>
                <p className="text-sm text-themeDarkGray">
                  Track driver payouts and your business profitability
                </p>
              </div>

              {/* Period tabs */}
              <div className="flex items-center gap-1 bg-contentBg rounded-lg p-1">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-150 ${
                      period === p
                        ? "bg-white text-themeOrange shadow-sm"
                        : "text-themeDarkGray hover:text-themeLightBlack"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Error banner ── */}
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <p className="text-sm text-red-600">
                  Failed to load earnings data.
                </p>
                <button
                  onClick={() => refetch()}
                  className="text-xs text-red-600 underline font-medium"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── Metric Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label="Net Profit"
                value={summary ? fmt(summary.net_profit) : "$0.00"}
                sub={summary ? `${summary.profit_margin}% margin` : undefined}
                accent
                loading={isLoading}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                }
              />
              <MetricCard
                label="Total Revenue"
                value={summary ? fmt(summary.total_revenue) : "$0.00"}
                sub={summary ? `${summary.orders_count} orders` : undefined}
                loading={isLoading}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
              />
              <MetricCard
                label="Driver Payouts"
                value={summary ? fmt(summary.total_driver_payouts) : "$0.00"}
                sub={
                  drivers.length > 0 ? `${drivers.length} drivers` : undefined
                }
                loading={isLoading}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                }
              />
              <MetricCard
                label="Avg Order Value"
                value={summary ? fmt(summary.avg_order_value) : "$0.00"}
                sub={
                  summary ? `+${fmt(summary.total_tips)} in tips` : undefined
                }
                loading={isLoading}
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                }
              />
            </div>

            {/* ── Chart + Breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Revenue chart */}
              <div className="lg:col-span-2 bg-white border border-contentBg rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-themeLightBlack">
                    Daily Revenue vs Payout
                  </h2>
                  <div className="flex items-center gap-3 text-xs text-themeDarkGray">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-themeOrange/80 inline-block" />
                      Profit
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-sm bg-contentBg inline-block border border-gray-200" />
                      Driver Cost
                    </span>
                  </div>
                </div>

                <StackedChart
                  data={
                    daily.length
                      ? daily
                      : Array.from({ length: 7 }, (_, i) => ({
                          date: [
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ][i],
                          revenue: 0,
                          driver_cost: 0,
                          profit: 0,
                        }))
                  }
                  loading={isLoading}
                />

                {/* Daily value labels */}
                {!isLoading && daily.length > 0 && (
                  <div
                    className="grid gap-1 pt-1 border-t border-contentBg"
                    style={{
                      gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {daily.map((d) => (
                      <div
                        key={d.date}
                        className="flex flex-col items-center gap-0.5"
                      >
                        <span className="text-[10px] font-semibold text-themeLightBlack">
                          {fmt(d.revenue).replace("$", "")}
                        </span>
                        <span className="text-[9px] text-themeOrange font-medium">
                          {fmt(d.profit).replace("$", "")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Revenue breakdown */}
              <div className="bg-white border border-contentBg rounded-lg p-4 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-themeLightBlack">
                  Revenue Breakdown
                </h2>
                <div className="flex flex-col gap-2 flex-1 justify-center">
                  {[
                    {
                      label: "Revenue",
                      value: summary?.total_revenue ?? 0,
                      color: "bg-themeOrange",
                    },
                    {
                      label: "Driver Pay",
                      value: summary?.total_driver_payouts ?? 0,
                      color: "bg-orange-200",
                    },
                    {
                      label: "Tips (passed)",
                      value: summary?.total_tips ?? 0,
                      color: "bg-orange-100",
                    },
                    {
                      label: "Net Profit",
                      value: summary?.net_profit ?? 0,
                      color: "bg-green-400",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-themeDarkGray">{item.label}</span>
                        {isLoading ? (
                          <div className="h-3 w-16 bg-contentBg rounded animate-pulse" />
                        ) : (
                          <span className="font-semibold text-themeLightBlack">
                            {fmt(item.value)}
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-contentBg rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-700`}
                          style={{
                            width:
                              !isLoading && (summary?.total_revenue ?? 0) > 0
                                ? `${(item.value / summary!.total_revenue) * 100}%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-contentBg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-themeDarkGray">Profit Margin</span>
                    {isLoading ? (
                      <div className="h-3 w-10 bg-contentBg rounded animate-pulse" />
                    ) : (
                      <span className="font-bold text-themeOrange">
                        {summary?.profit_margin ?? 0}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Driver Earnings Table ── */}
            <div className="bg-white border border-contentBg rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-contentBg">
                <h2 className="text-sm font-semibold text-themeLightBlack">
                  Driver Earnings — {period}
                </h2>
                <button
                  onClick={() =>
                    drivers.length && exportDriversCsv(drivers, period)
                  }
                  disabled={!drivers.length || isLoading}
                  className="text-xs text-themeOrange hover:underline font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-contentBg/40">
                      <th className="text-left text-xs text-themeDarkGray font-medium px-4 py-2">
                        Driver
                      </th>
                      <th className="text-center text-xs text-themeDarkGray font-medium px-4 py-2">
                        Orders
                      </th>
                      <th className="text-right text-xs text-themeDarkGray font-medium px-4 py-2">
                        Base Pay
                      </th>
                      <th className="text-right text-xs text-themeDarkGray font-medium px-4 py-2">
                        Tips
                      </th>
                      <th className="text-right text-xs text-themeDarkGray font-medium px-4 py-2">
                        Bonuses
                      </th>
                      <th className="text-right text-xs text-themeDarkGray font-medium px-4 py-2">
                        Total
                      </th>
                      <th className="text-center text-xs text-themeDarkGray font-medium px-4 py-2">
                        Status
                      </th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableSkeletonRow key={i} />
                      ))
                    ) : !drivers.length ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-8 text-center text-sm text-themeDarkGray"
                        >
                          No driver earnings found for {period.toLowerCase()}.
                        </td>
                      </tr>
                    ) : (
                      drivers.map((d) => (
                        <>
                          <tr
                            key={d.driver_id}
                            onClick={() =>
                              setActiveDriverId(
                                activeDriverId === d.driver_id
                                  ? null
                                  : d.driver_id,
                              )
                            }
                            className={`border-b border-contentBg cursor-pointer transition-colors ${
                              activeDriverId === d.driver_id
                                ? "bg-orange-50"
                                : "hover:bg-contentBg/30"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-themeOrange/10 text-themeOrange flex items-center justify-center text-xs font-bold shrink-0">
                                  {d.driver_name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <span className="font-medium text-themeLightBlack">
                                  {d.driver_name}
                                </span>
                              </div>
                            </td>
                            <td className="text-center px-4 py-3 text-themeLightBlack font-medium">
                              {d.orders_completed}
                            </td>
                            <td className="text-right px-4 py-3 text-themeLightBlack">
                              {fmt(d.base_pay)}
                            </td>
                            <td className="text-right px-4 py-3 text-themeLightBlack">
                              {fmt(d.tips)}
                            </td>
                            <td className="text-right px-4 py-3 text-themeLightBlack">
                              {d.bonuses > 0 ? (
                                <span className="text-green-600 font-medium">
                                  +{fmt(d.bonuses)}
                                </span>
                              ) : (
                                <span className="text-themeDarkGray">—</span>
                              )}
                            </td>
                            <td className="text-right px-4 py-3 font-bold text-themeLightBlack">
                              {fmt(d.total_earnings)}
                            </td>
                            <td className="text-center px-4 py-3">
                              <StatusBadge status={d.status} />
                            </td>
                            <td className="px-4 py-3">
                              <svg
                                className={`w-4 h-4 text-themeDarkGray transition-transform duration-200 ${
                                  activeDriverId === d.driver_id
                                    ? "rotate-90"
                                    : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </td>
                          </tr>

                          {/* Inline expanded detail row */}
                          {activeDriverId === d.driver_id && (
                            <tr key={`detail-${d.driver_id}`}>
                              <td colSpan={8} className="p-0">
                                <DriverDetailPanel
                                  driver={d}
                                  apiPeriod={apiPeriod}
                                />
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>

                  {/* Totals footer */}
                  {!isLoading && drivers.length > 0 && (
                    <tfoot>
                      <tr className="bg-contentBg/40">
                        <td className="px-4 py-2 text-xs font-bold text-themeLightBlack">
                          Totals
                        </td>
                        <td className="text-center px-4 py-2 text-xs font-bold text-themeLightBlack">
                          {drivers.reduce((s, d) => s + d.orders_completed, 0)}
                        </td>
                        <td className="text-right px-4 py-2 text-xs font-bold text-themeLightBlack">
                          {fmt(drivers.reduce((s, d) => s + d.base_pay, 0))}
                        </td>
                        <td className="text-right px-4 py-2 text-xs font-bold text-themeLightBlack">
                          {fmt(drivers.reduce((s, d) => s + d.tips, 0))}
                        </td>
                        <td className="text-right px-4 py-2 text-xs font-bold text-green-600">
                          +{fmt(drivers.reduce((s, d) => s + d.bonuses, 0))}
                        </td>
                        <td className="text-right px-4 py-2 text-xs font-bold text-themeOrange">
                          {fmt(
                            drivers.reduce((s, d) => s + d.total_earnings, 0),
                          )}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        </ContentBox>
      </div>
    </div>
  );
};

export default EarningsPage;
