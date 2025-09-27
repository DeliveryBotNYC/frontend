import { ReactNode } from "react";
import settingsIcon from "../../assets/settings-white.svg";

interface IntegrationCardProps {
  icon: string;
  title: string;
  isConnected?: boolean;
  isLoading?: boolean;
  onConfigure: () => void;
  children?: ReactNode;
  href?: string;
  lastUsed?: string;
  subtext?: string;
  error?: string;
}

const IntegrationCard = ({
  icon,
  title,
  isConnected = false,
  isLoading = false,
  onConfigure,
  children,
  href,
  lastUsed,
  subtext,
  error,
}: IntegrationCardProps) => {
  const buttonColor = isConnected ? "bg-themeLightOrangeTwo" : "bg-themeGreen";
  const buttonText = isConnected ? "Edit" : "Configuration";

  return (
    <div className="w-full group">
      <div className="w-full bg-themeLightGray rounded-2xl px-5 py-themePadding flex flex-col justify-between items-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-gray-200">
        {/* Status and Info Bar */}
        <div className="w-full flex justify-between items-center mb-2 h-4">
          {/* Status Indicator */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Inactive</span>
            </div>
          )}

          {/* Error Indicator */}
          {error && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-red-500">Error</span>
            </div>
          )}

          {/* Request Count */}
          {subtext !== undefined && (
            <span className="text-xs text-gray-500">{subtext}</span>
          )}
        </div>

        {/* Icon */}
        <div className="w-full flex justify-center items-center mb-2.5 h-28">
          <img
            src={icon}
            alt={`${title} icon`}
            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </div>

        {/* Title */}
        <div className="w-full">
          {href ? (
            <a href={href} target="_blank" rel="noopener noreferrer">
              <p className="text-themeDarkGray text-sm md:text-base text-center hover:text-themeGreen transition-colors">
                {title}
              </p>
            </a>
          ) : (
            <p className="text-themeDarkGray text-sm md:text-base text-center">
              {title}
            </p>
          )}

          {/* Configuration Button */}
          <button
            onClick={onConfigure}
            disabled={isLoading}
            className={`w-full ${buttonColor} py-2.5 rounded-full flex items-center justify-center gap-2.5 mt-2.5 hover:translate-y-1 duration-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            aria-label={`Configure ${title} integration`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <p className="text-white">{buttonText}</p>
                <img src={settingsIcon} alt="settings icon" />
              </>
            )}
          </button>
        </div>

        {/* Additional Content */}
        {children}
      </div>
    </div>
  );
};

export default IntegrationCard;
