import { useContext, useMemo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";

import StatusDropdown from "../reusable/StatusDropdown";
import Progressbar from "../reusable/Progressbar";
import InfoDetails from "./InfoDetails";
import ShowTrackingSwitch from "./ShowTrackingSwitch";

import CloseIcon from "../../assets/close-orange.svg";
import WarningIcon from "../../assets/warning.svg";
import PrintIcon from "../../assets/print-2.svg";
import ShareIcon from "../../assets/share.svg";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { useConfig, url } from "../../hooks/useConfig";

import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import useClickOutside from "../../hooks/useHandleOutsideClick";
import ReportDropdown from "./ReportDropdown";

import CancelOrderPopup from "../popups/CancelOrderPopup";
import BlackOverlay from "../popups/BlackOverlay";
import ReportPODPopup from "../popups/ReportPODPopup";
import useAuth from "../../hooks/useAuth";

type Driver = {
  driver_id: number;
  firstname: string;
  lastname: string;
  phone: string;
  phone_formatted: string;
  model: string;
  make: string;
  level: string;
  rating: string;
};

interface OrderTrackingInfoProps {
  data: any;
  clearOrderSelection?: () => void;
  availableDrivers?: Driver[];
}

const OrderTrackingInfo = ({
  data,
  clearOrderSelection,
  availableDrivers = [],
}: OrderTrackingInfoProps) => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const config = useConfig();
  const location = useLocation();

  // Driver dropdown state
  const [driverSearchTerm, setDriverSearchTerm] = useState("");
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);
  const driverDropdownRef = useRef<HTMLDivElement>(null);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return auth?.roles?.includes(5150);
  }, [auth?.roles]);

  // Toggle Dropdown by custom hook
  const { isOpen, setIsOpen, dropdownRef, dotRef } =
    useClickOutside<HTMLDivElement>(false);

  // Current Order Status
  const currentStatus = data?.status;

  // Get current driver info
  const currentDriverId = data?.driver?.driver_id;
  const currentDriver = availableDrivers.find(
    (d) => d.driver_id === currentDriverId
  );

  // Preserve URL parameters when navigating back
  const backToOrdersUrl = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return `/orders?${searchParams.toString()}`;
  }, [location.search]);

  // Handle close button click
  const handleCloseClick = () => {
    if (clearOrderSelection) {
      clearOrderSelection();
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      // Update the status via API
      await axios.patch(
        `${url}/order/${data.order_id}`,
        {
          status: newStatus,
        },
        config
      );

      // Invalidate and refetch the order data
      queryClient.invalidateQueries(["order", data.order_id]);

      // You might also want to show a success toast notification here
    } catch (error) {
      console.error("Failed to update order status:", error);
      // Show error notification to user
    }
  };

  // Handle driver change
  const handleDriverChange = async (driver: Driver | null) => {
    try {
      await axios.patch(
        `${url}/order/${data.order_id}`,
        {
          driver_id: driver?.driver_id || null,
        },
        config
      );

      // Invalidate and refetch the order data
      queryClient.invalidateQueries(["order", data.order_id]);

      setIsDriverDropdownOpen(false);
      setDriverSearchTerm("");
    } catch (error) {
      console.error("Failed to update driver:", error);
      // Show error notification to user
    }
  };

  // Click outside handler for driver dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        driverDropdownRef.current &&
        !driverDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDriverDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter drivers based on search term
  const filteredDrivers = availableDrivers.filter((driver) =>
    (driver.firstname + " " + driver.lastname)
      .toLowerCase()
      .includes(driverSearchTerm.toLowerCase())
  );

  const currentDriverName = currentDriver
    ? `${currentDriver.firstname} ${currentDriver.lastname}`
    : "No Driver";

  // Handle label download
  // Add state for download loading
  const [isDownloadingLabel, setIsDownloadingLabel] = useState(false);

  // Handle label download - downloads all labels in one PDF with rate limiting
  const handleDownloadLabel = async () => {
    if (isDownloadingLabel) return; // Prevent multiple clicks

    setIsDownloadingLabel(true);

    try {
      const deliveryItems = data?.delivery?.items;

      if (!deliveryItems || deliveryItems.length === 0) {
        console.error("No delivery items found");
        alert("No delivery items found");
        setIsDownloadingLabel(false);
        return;
      }

      // Filter items that have shipping labels
      const itemsWithLabels = deliveryItems.filter(
        (item: any) => item?.shipping_label?.label_string
      );

      if (itemsWithLabels.length === 0) {
        console.error("No labels found");
        alert("No labels found");
        setIsDownloadingLabel(false);
        return;
      }

      // Helper function to delay execution
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      // Helper function to fetch a single label with retry logic
      const fetchLabelPDF = async (
        labelString: string,
        retries = 3
      ): Promise<ArrayBuffer | null> => {
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            const zplString = atob(labelString);

            const response = await fetch(
              "http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/",
              {
                method: "POST",
                headers: {
                  Accept: "application/pdf",
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: zplString,
              }
            );

            if (response.status === 429) {
              // Rate limited - wait longer before retry
              const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
              console.log(
                `Rate limited. Waiting ${waitTime}ms before retry...`
              );
              await delay(waitTime);
              continue;
            }

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            // Validate that we got a PDF
            const uint8Array = new Uint8Array(arrayBuffer);
            const header = String.fromCharCode(...uint8Array.slice(0, 5));
            if (!header.startsWith("%PDF")) {
              throw new Error("Invalid PDF received");
            }

            return arrayBuffer;
          } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === retries - 1) {
              return null; // Failed all retries
            }
            await delay(1000 * (attempt + 1)); // Wait before retry
          }
        }
        return null;
      };

      // If only one label, use simplified logic
      if (itemsWithLabels.length === 1) {
        const labelString = itemsWithLabels[0].shipping_label.label_string;
        const arrayBuffer = await fetchLabelPDF(labelString);

        if (!arrayBuffer) {
          console.error("Failed to fetch label");
          alert("Failed to download label. Please try again.");
          setIsDownloadingLabel(false);
          return;
        }

        const blob = new Blob([arrayBuffer], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `DBX${data?.order_id}_label.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setIsDownloadingLabel(false);
        return;
      }

      // Multiple labels - fetch sequentially with delays to avoid rate limiting
      console.log(`Fetching ${itemsWithLabels.length} labels...`);
      const pdfBlobs: ArrayBuffer[] = [];

      for (let i = 0; i < itemsWithLabels.length; i++) {
        console.log(`Fetching label ${i + 1} of ${itemsWithLabels.length}...`);

        const labelString = itemsWithLabels[i].shipping_label.label_string;
        const arrayBuffer = await fetchLabelPDF(labelString);

        if (arrayBuffer) {
          pdfBlobs.push(arrayBuffer);
        } else {
          console.error(`Failed to fetch label ${i + 1}`);
        }

        // Add delay between requests to avoid rate limiting (except for last item)
        if (i < itemsWithLabels.length - 1) {
          await delay(500); // 500ms delay between requests
        }
      }

      if (pdfBlobs.length === 0) {
        console.error("Failed to fetch any labels");
        alert("Failed to download labels. Please try again.");
        setIsDownloadingLabel(false);
        return;
      }

      // Use pdf-lib to merge PDFs
      const { PDFDocument } = await import("pdf-lib");

      const mergedPdf = await PDFDocument.create();

      for (const pdfBytes of pdfBlobs) {
        try {
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } catch (error) {
          console.error("Failed to merge one of the PDFs:", error);
          // Continue with other PDFs
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `DBX${data?.order_id}_labels.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`Successfully downloaded ${pdfBlobs.length} labels`);
    } catch (error) {
      console.error("Failed to download labels:", error);
      alert("An error occurred while downloading labels. Please try again.");
    } finally {
      setIsDownloadingLabel(false);
    }
  };

  return (
    <div>
      <div className="w-[366px] absolute h-full top-1/2 -translate-y-1/2 right-5 z-[999] rounded-2xl py-3">
        <div className="h-full flex flex-col items-center justify-between gap-3">
          {/* Main Tracking Details Card */}
          <div
            className={`w-[366px] h-full p-5 bg-white flex flex-col justify-between rounded-2xl overflow-auto`}
          >
            {/* Top Part */}
            <div>
              {/* Order Id */}
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-lg">
                    <span className="text-themeOrange">DBX</span>
                    <span className="text-black font-semibold">
                      {data?.order_id}
                    </span>
                  </p>
                  {data?.status === "processing" ||
                  data?.status === "assigned" ||
                  data?.status === "arrived_at_pickup" ? (
                    <button
                      className={`w-7 h-7 rounded-full text-white flex items-center justify-center font-bold transition-colors ${
                        isDownloadingLabel
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-themeOrange cursor-pointer hover:bg-orange-500"
                      }`}
                      type="button"
                      onClick={handleDownloadLabel}
                      disabled={isDownloadingLabel}
                      title={
                        isDownloadingLabel
                          ? "Downloading labels..."
                          : "Download label"
                      }
                    >
                      {isDownloadingLabel ? (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
                        <img
                          src={PrintIcon}
                          alt="download-label"
                          style={{ filter: "invert(1)" }}
                          width={15}
                        />
                      )}
                    </button>
                  ) : (
                    ""
                  )}
                  <a
                    href={data?.tracking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 cursor-pointer rounded-full bg-themeOrange text-white flex items-center justify-center font-bold hover:bg-orange-500 transition-colors"
                  >
                    <img
                      src={ShareIcon}
                      alt="share"
                      style={{ filter: "invert(1)" }}
                      width={15}
                    />
                  </a>
                </div>

                {/* Conditional close button rendering */}
                {clearOrderSelection ? (
                  <img
                    src={CloseIcon}
                    alt="close-icon"
                    className="cursor-pointer"
                    onClick={handleCloseClick}
                  />
                ) : (
                  <Link to={backToOrdersUrl}>
                    <img
                      src={CloseIcon}
                      alt="close-icon"
                      className="cursor-pointer"
                    />
                  </Link>
                )}
              </div>

              {/* Status Dropdown and Driver Dropdown (Admin) */}
              <div className="mt-2.5 flex items-center gap-2">
                {/* Status Dropdown */}
                {currentStatus && (
                  <div className="flex-1">
                    <StatusDropdown
                      currentStatus={currentStatus}
                      orderId={data?.order_id}
                      isAdmin={isAdmin}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                )}

                {/* Driver Dropdown (Admin Only) */}
                {isAdmin && (
                  <div className="flex-1 relative" ref={driverDropdownRef}>
                    <div
                      className="flex items-center border border-gray-300 rounded px-2 py-1.5 cursor-pointer bg-white hover:border-themeOrange transition-colors"
                      onClick={() =>
                        setIsDriverDropdownOpen(!isDriverDropdownOpen)
                      }
                    >
                      <input
                        type="text"
                        placeholder={currentDriverName}
                        value={driverSearchTerm}
                        onChange={(e) => {
                          e.stopPropagation();
                          setDriverSearchTerm(e.target.value);
                          setIsDriverDropdownOpen(true);
                        }}
                        className="text-xs w-full focus:outline-none bg-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-1 flex-shrink-0"
                      >
                        <path
                          d="M19 9l-7 7-7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {isDriverDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {/* Option to clear driver */}
                        <div
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs border-b border-gray-200"
                          onClick={() => handleDriverChange(null)}
                        >
                          <em>No Driver (Unassign)</em>
                        </div>
                        {filteredDrivers.length > 0 ? (
                          filteredDrivers.map((driver) => (
                            <div
                              key={driver.driver_id}
                              className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-xs ${
                                currentDriverId === driver.driver_id
                                  ? "bg-blue-50"
                                  : ""
                              }`}
                              onClick={() => handleDriverChange(driver)}
                            >
                              {driver.firstname} {driver.lastname}
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-xs text-gray-500">
                            No drivers found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* delivery address and pickup address */}
              <div className="w-full flex items-center justify-between gap-2.5 py-2.5">
                {/* Pickup */}
                <div>
                  <p className="text-xs text-themeDarkGray">
                    {data?.pickup?.address.street_address_1}
                  </p>
                  <p className="text-xs text-themeDarkGray">
                    {data?.pickup?.name}
                  </p>
                </div>

                {/* delivery */}
                <div className="text-right">
                  <p className="text-xs text-themeDarkGray">
                    {data?.delivery?.address.street_address_1}
                  </p>
                  <p className="text-xs text-themeDarkGray">
                    {data?.delivery?.name}
                  </p>
                </div>
              </div>

              {/* Status */}
              <>
                {/* Progressbar */}
                <div className="pb-3">
                  <Progressbar
                    value={currentStatus === "delivered" ? "100%" : "70%"}
                    status={currentStatus || ""}
                  />
                </div>

                {/* Delivery tracking */}
                <div className="w-full">
                  <InfoDetails items={data} />
                </div>
              </>
            </div>

            <div className="flex items-center justify-center gap-2.5 mt-16">
              <p className="text-themeDarkGray text-xs">
                Show detailed tracking
              </p>

              {/* Switch */}
              <ShowTrackingSwitch />
            </div>
          </div>

          <div className="w-full bg-white rounded-2xl flex items-center justify-between gap-2.5 py-4">
            {/* left */}
            <div className="w-full flex items-center justify-center">
              <Link to={`/orders/edit/${data?.order_id}`}>
                <p className="text-xs text-themeLightOrangeTwo">
                  View/edit order details
                </p>
              </Link>
            </div>

            {/* Right Side */}
            <div className="w-full flex items-center justify-center">
              <div className="absolute bottom-7" ref={dotRef}>
                {isOpen === true ? (
                  <img
                    src={CloseIcon}
                    alt="close-icon"
                    className="cursor-pointer w-3"
                    onClick={() => setIsOpen(false)}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center gap-2.5 cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  >
                    <img src={WarningIcon} alt="warning-icon" />

                    <p className="text-xs text-themeDarkRed">
                      Report a problem
                    </p>
                  </div>
                )}
              </div>
              {/* Popup */}
              {isOpen === true ? (
                <ReportDropdown
                  closeDropdown={() => setIsOpen(false)}
                  orderId={data.order_id}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
      {/* Black Overlay */}
      {contextValue?.showCancelPopup === true ||
      contextValue?.showReportPOD === true ? (
        <BlackOverlay />
      ) : null}

      {/* Popup */}
      <CancelOrderPopup orderId={data.order_id} />
      <ReportPODPopup orderId={data.order_id} />
    </div>
  );
};

export default OrderTrackingInfo;
