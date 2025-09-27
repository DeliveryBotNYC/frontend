import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import moment from "moment";
import toast from "react-hot-toast";

import ApiStats from "../reusable/ApiStats";
import ZapietIcon from "../../assets/zapiet.png";
import CloseIcon from "../../assets/close-gray.svg";
import CopyIcon from "../../assets/copy-icon.svg";

type PopupMode = "edit" | "generate" | "generated";

interface ZapietData {
  requests: number;
  last_used: string;
  created_at: string;
  token?: string;
}

const ZapietPopup = () => {
  const config = useConfig();
  const contextValue = useContext(ThemeContext);

  const [accountData, setAccountData] = useState<ZapietData>({
    requests: 0,
    last_used: "",
    created_at: "",
  });

  // Determine current popup mode
  const getCurrentMode = (): PopupMode | null => {
    if (contextValue?.editZapiet) return "edit";
    if (contextValue?.generateZapiet) return "generate";
    if (contextValue?.showGeneratedZapietKey) return "generated";
    return null;
  };

  const currentMode = getCurrentMode();

  // Get Zapiet data for edit mode - Fixed the enabled condition
  const { isLoading, data, error, status, refetch } = useQuery({
    queryKey: ["get_zapiet"],
    queryFn: async () => {
      const response = await axios.get(url + "/integrations/zapiet", config);
      // Fixed: Check the actual response structure - might be response.data instead of response.data.data.data
      return response.data?.data || response.data;
    },
    enabled: currentMode === "edit", // This should work now
    retry: 1,
  });

  // Update Zapiet mutation for edit mode
  const updateZapietMutation = useMutation({
    mutationFn: () => {
      return axios.delete(url + "/integrations/zapiet", config);
    },
    onSuccess: () => {
      toast.success("Zapiet updated successfully!");
      // Refetch the data after update
      refetch();
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("zapietKeyUpdated"));
    },
    onError: (error) => {
      toast.error("Failed to update Zapiet");
      console.error("Update Zapiet error:", error);
    },
  });

  // Generate Zapiet key mutation
  const generateZapietMutation = useMutation({
    mutationFn: () => {
      return axios.post(url + "/integrations/zapiet", null, config);
    },
    onSuccess: () => {
      toast.success("Zapiet key generated successfully!");
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("zapietKeyGenerated"));
    },
    onError: (error) => {
      toast.error("Failed to generate Zapiet key");
      console.error("Generate Zapiet error:", error);
    },
  });

  // Delete Zapiet mutation
  const deleteZapietMutation = useMutation({
    mutationFn: () => {
      return axios.delete(url + "/integrations/zapiet", config);
    },
    onSuccess: () => {
      toast.success("Zapiet deleted successfully!");
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("zapietKeyDeleted"));
      closePopup();
    },
    onError: (error) => {
      toast.error("Failed to delete Zapiet");
      console.error("Delete Zapiet error:", error);
    },
  });

  // Set account data when Zapiet data loads - Fixed data handling
  useEffect(() => {
    if (status === "success" && data) {
      console.log("Zapiet data received:", data); // Debug log
      setAccountData({
        requests: data.requests || 0,
        last_used: data.last_used || "",
        created_at: data.created_at || "",
      });
    }
  }, [status, data]);

  // Debug effect to check if mode changes
  useEffect(() => {
    console.log("Current mode:", currentMode);
    console.log("Context values:", {
      editZapiet: contextValue?.editZapiet,
      generateZapiet: contextValue?.generateZapiet,
      showGeneratedZapietKey: contextValue?.showGeneratedZapietKey,
    });
  }, [currentMode, contextValue]);

  // Auto-generate Zapiet key when generated popup opens
  useEffect(() => {
    if (currentMode === "generated") {
      generateZapietMutation.mutate();
    }
  }, [currentMode]);

  // Close popup handlers
  const closePopup = () => {
    contextValue?.setEditZapiet(false);
    contextValue?.setGenerateZapiet(false);
    contextValue?.setShowGeneratedZapietKey(false);
  };

  // Mode-specific handlers
  const handleEditToGenerate = () => {
    if (
      window.confirm(
        "Are you sure you want to update your Zapiet key? This action cannot be undone and will invalidate your current key."
      )
    ) {
      updateZapietMutation.mutate(undefined, {
        onSuccess: () => {
          // Go directly to generated state instead of generate
          contextValue?.setEditZapiet(false);
          contextValue?.setShowGeneratedZapietKey(true);
        },
      });
    }
  };

  const handleGenerateToGenerated = () => {
    contextValue?.setGenerateZapiet(false);
    contextValue?.setShowGeneratedZapietKey(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Zapiet key copied!");
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this Zapiet key? This action cannot be undone."
      )
    ) {
      deleteZapietMutation.mutate();
    }
  };

  // Helper function to format dates safely
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = moment(dateString);
    return date.isValid() ? date.format("MM/DD/YY h:mm a") : "Invalid date";
  };

  // Don't render if no mode is active
  if (!currentMode) return null;

  // Render content based on mode
  const renderContent = () => {
    switch (currentMode) {
      case "edit":
        return (
          <>
            <div className="w-full mt-4">
              <h3 className="text-black font-semibold text-lg">Zapiet</h3>
              <p className="text-sm text-themeDarkGray mt-1">
                Zapiet allows you to integrate your custom application and
                website with Delivery Bot's courier network.
              </p>
              <Link to="https://www.google.com" target="_blank">
                <p className="text-themeDarkBlue text-sm mt-3">
                  Documentation: www.dbx.delivery/zapiet
                </p>
              </Link>
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="mt-5 text-center">
                <p className="text-themeDarkGray">Loading Zapiet data...</p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="mt-5 text-center">
                <p className="text-red-500">Failed to load Zapiet data</p>
                <button
                  onClick={() => refetch()}
                  className="text-themeDarkBlue text-sm mt-2 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Success state */}
            {status === "success" && data && (
              <div className="mt-5">
                <ApiStats
                  label="Date created:"
                  value={formatDate(accountData.created_at)}
                />
                <ApiStats
                  label="Last used:"
                  value={formatDate(accountData.last_used)}
                />
                <ApiStats
                  label="Number of requests"
                  value={accountData.requests.toString()}
                />
              </div>
            )}

            <div className="space-y-3 mt-3">
              <button
                onClick={handleEditToGenerate}
                disabled={updateZapietMutation.isPending}
                className="w-full bg-themeLightOrangeTwo py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50"
              >
                {updateZapietMutation.isPending ? "Updating..." : "Update"}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteZapietMutation.isPending}
                className="w-full bg-red-500 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200 disabled:opacity-50"
              >
                {deleteZapietMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </>
        );

      case "generate":
        return (
          <>
            <div className="w-full mt-4">
              <h3 className="text-black font-semibold text-lg">Zapiet</h3>
              <p className="text-sm text-themeDarkGray mt-1">
                Zapiet allows you to integrate your custom application and
                website with Delivery Bot's courier network.
              </p>
              <Link to="https://www.google.com" target="_blank">
                <p className="text-themeDarkBlue text-sm mt-3">
                  Documentation: www.dbx.delivery/zapiet
                </p>
              </Link>
            </div>

            <button
              onClick={handleGenerateToGenerated}
              className="w-full bg-themeLightOrangeTwo mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
            >
              Generate key
            </button>
          </>
        );

      case "generated":
        return (
          <>
            <div className="w-full mt-4">
              <h3 className="text-black font-semibold text-lg">
                Keep your key safe!
              </h3>
              <p className="text-sm text-themeDarkGray mt-1">
                Keep your key safe and store it in a secure place. You won't be
                able to see it again.
              </p>

              <div className="w-full mt-6">
                <p className="text-xs text-themeDarkGray">Zapiet key</p>
                <div className="border-b border-b-themeLightGray pb-[2px] flex items-center justify-between gap-2.5">
                  <p className="text-black w-full overflow-auto">
                    {generateZapietMutation.isPending
                      ? "Generating..."
                      : generateZapietMutation.data?.data?.data?.token ||
                        generateZapietMutation.data?.data?.token ||
                        "Failed to generate"}
                  </p>
                  {(generateZapietMutation.data?.data?.data?.token ||
                    generateZapietMutation.data?.data?.token) && (
                    <div
                      onClick={() =>
                        handleCopy(
                          generateZapietMutation.data.data.data.token ||
                            generateZapietMutation.data.data.token
                        )
                      }
                    >
                      <img
                        src={CopyIcon}
                        alt="copyBtn"
                        className="cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={closePopup}
              className="w-full bg-themeGreen mt-8 py-2.5 text-white font-semibold rounded-lg shadow-btnShadow hover:scale-95 duration-200"
            >
              Continue
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-[90%] max-w-[400px] bg-white rounded-xl p-6 fixed left-1/2 top-1/2 ${
        currentMode
          ? contextValue?.showPopupStyles
          : contextValue?.hidePopupStyles
      } -translate-x-1/2 -translate-y-1/2 z-[99999] duration-300`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <img src={ZapietIcon} alt="zapiet-icon" width={60} />
        <div onClick={closePopup}>
          <img src={CloseIcon} alt="close-icon" className="cursor-pointer" />
        </div>
      </div>

      {renderContent()}
    </div>
  );
};

export default ZapietPopup;
