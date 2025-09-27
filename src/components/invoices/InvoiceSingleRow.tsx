import moment from "moment";
import StatusBtn from "../reusable/StatusBtn";

interface OrderItem {
  order_id: string;
  external_id: string;
  status: string;
  price: number;
  tip: number;
  amount: number;
  pickup: {
    name: string;
    address: {
      street_address_1: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  delivery: {
    name: string;
    address: {
      street_address_1: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  created_at: string;
}

interface User {
  user_id: number;
  name: string;
}

interface InvoiceItem {
  invoice_id: string;
  user_id: number;
  start_date: string;
  end_date: string;
  amount: number;
  payment_method: string;
  status: string;
  url: string | null;
  date: string;
  orders: OrderItem[];
  user: User;
}

interface InvoiceSingleRowProps {
  item: InvoiceItem;
  isAdmin?: boolean;
}

const InvoiceSingleRow = ({ item, isAdmin = false }: InvoiceSingleRowProps) => {
  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Downloading billing invoice:", item.invoice_id);
    if (item.url) {
      window.open(item.url, "_blank");
    }
  };

  const handleDownloadDetailedReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Downloading detailed report for:", item.invoice_id);

    if (!item.orders || item.orders.length === 0) {
      console.warn("No orders data available for detailed report");
      return;
    }

    // Prepare CSV data from orders
    const csvHeaders = [
      "Order ID",
      "External ID",
      "Status",
      "Price ($)",
      "Tip ($)",
      "Total Amount ($)",
      "Pickup Name",
      "Pickup Address",
      "Pickup City",
      "Pickup State",
      "Pickup ZIP",
      "Delivery Name",
      "Delivery Address",
      "Delivery City",
      "Delivery State",
      "Delivery ZIP",
      "Created Date",
    ];

    const csvRows = item.orders.map((order) => [
      order.order_id,
      order.external_id || "",
      order.status,
      (order.price / 100).toFixed(2),
      (order.tip / 100).toFixed(2),
      (order.amount / 100).toFixed(2),
      order.pickup.name,
      order.pickup.address.street_address_1,
      order.pickup.address.city,
      order.pickup.address.state,
      order.pickup.address.zip,
      order.delivery.name,
      order.delivery.address.street_address_1,
      order.delivery.address.city,
      order.delivery.address.state,
      order.delivery.address.zip,
      moment(order.created_at).format("MM/DD/YYYY HH:mm:ss"),
    ]);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `detailed_report_${item.invoice_id}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDateRange = () => {
    if (item.start_date && item.end_date) {
      const startDate = moment(item.start_date).format("MM/DD/YY");
      const endDate = moment(item.end_date).format("MM/DD/YY");
      return `${startDate} - ${endDate}`;
    }
    return "N/A";
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  return (
    <div className="flex w-full bg-white hover:bg-contentBg duration-200 border-b border-b-themeLightGray">
      {/* Invoice Number */}
      <div className="flex-1 py-3 px-themePadding">
        <span className="text-themeOrange font-medium">
          {item?.invoice_id?.slice(0, 8)}-
        </span>
        {item?.invoice_id?.slice(9)}
      </div>

      {/* Status */}
      <div className="flex-1 py-3 px-themePadding">
        <StatusBtn type={item?.status} />
      </div>

      {/* Date */}
      <div className="flex-1 py-3 px-themePadding">
        {moment(item?.date).format("MM/DD/YY")}
      </div>

      {/* Date Range */}
      <div className="flex-1 py-3 px-themePadding">{formatDateRange()}</div>

      {/* Amount */}
      <div className="flex-1 py-3 px-themePadding">
        ${formatCurrency(item?.amount)}
      </div>

      {/* Payment Method */}
      <div className="flex-1 py-3 px-themePadding">
        {item?.payment_method || "N/A"}
      </div>

      {/* User Name - Only show for admin, positioned after Payment Method */}
      {isAdmin && (
        <div className="flex-1 py-3 px-themePadding">
          {item?.user?.name || "N/A"}
        </div>
      )}

      {/* Actions */}
      <div className="flex-1 py-3 px-themePadding">
        <div className="flex items-center gap-2">
          {/* Billing Invoice Button - Only show if URL exists */}
          {item.url && (
            <button
              onClick={handleDownloadInvoice}
              className="bg-newOrderBtnBg py-1.5 px-3 rounded-[30px] text-white text-sm hover:opacity-90 transition-opacity duration-200"
              title="Download Billing Invoice"
            >
              Billing Invoice
            </button>
          )}

          {/* Detailed Report Button - Only show if orders exist */}
          {item.orders && item.orders.length > 0 && (
            <button
              onClick={handleDownloadDetailedReport}
              className="bg-newOrderBtnBg py-1.5 px-3 rounded-[30px] text-white text-sm hover:opacity-90 transition-opacity duration-200"
              title="Download Detailed Report"
            >
              Detailed Report
            </button>
          )}

          {/* Show message if no downloads available */}
          {!item.url && (!item.orders || item.orders.length === 0) && (
            <span className="text-gray-400 text-sm">No downloads</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceSingleRow;
