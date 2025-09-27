// UsersContent.jsx - Fixed Query Key for Filters
import { useContext, useState, useMemo } from "react";
import ContentBox2 from "../reusable/ContentBox2";
import TableToolbar from "../reusable/table/TableToolbar";
import TableContent from "../reusable/table/TableContent";
import TablePagination from "../reusable/table/TablePagination";
import UserSingleRow from "./UsersSingleRow";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "../reusable/exportUtils";
import { FaUser, FaUserShield } from "react-icons/fa";

const UsersContent = () => {
  const contextValue = useContext(ThemeContext);
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [totalValuesPerPage, setTotalValuesPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState({
    header: "created_at",
    order: "desc" as "asc" | "desc",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const config = useConfig();

  // Define filter configurations for users
  const userFilterConfigs = [
    {
      key: "roles",
      label: "Role",
      icon: <FaUserShield className="text-gray-500" size={14} />,
      type: "dropdown" as const,
      options: [
        { value: "admin", label: "Admin", description: "Full system access" },
        {
          value: "retail",
          label: "Retail",
          description: "Standard user access",
        },
        {
          value: "driver",
          label: "Driver",
          description: "Standard user access",
        },
      ],
    },
    {
      key: "statuses",
      label: "Status",
      icon: <FaUser className="text-gray-500" size={14} />,
      type: "dropdown" as const,
      options: [
        { value: "active", label: "Active", description: "User is active" },
        {
          value: "suspended",
          label: "Suspended",
          description: "User is suspended",
        },
        {
          value: "pending_approval",
          label: "Pending Approval",
          description: "User is waiting to be approved",
        },
        {
          value: "onboarding",
          label: "Onboarding",
          description: "Driver is on onboarding",
        },
        {
          value: "waitlist",
          label: "Waitlist",
          description: "Driver is on Waitlist",
        },
      ],
    },
  ];

  const headers = [
    { title: "User ID", value: "id" },
    { title: "Name", value: "name" },
    { title: "Email", value: "email" },
    { title: "Role", value: "role" },
    { title: "Status", value: "status" },
    { title: "Created At", value: "created_at" },
  ];

  // Create stable query key using useMemo
  const queryKey = useMemo(
    () => [
      "users",
      currentActivePage,
      totalValuesPerPage,
      sortBy.header,
      sortBy.order,
      contextValue?.userSearch || "",
      // Serialize filters to ensure stable comparison
      filters.roles?.sort().join(",") || "",
      filters.statuses?.sort().join(",") || "",
    ],
    [
      currentActivePage,
      totalValuesPerPage,
      sortBy.header,
      sortBy.order,
      contextValue?.userSearch,
      filters.roles,
      filters.statuses,
    ]
  );

  // Handle filter changes from the universal toolbar
  const handleFilterChange = (newFilters: any) => {
    console.log("Filter changed:", newFilters); // Debug log
    setFilters(newFilters);
    setCurrentActivePage(1);
  };

  // Fetch users data
  const { isLoading, data, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = {
        search: contextValue?.userSearch || "",
        page: currentActivePage,
        limit: totalValuesPerPage,
        sortBy: sortBy.header,
        sortOrder: sortBy.order,
      };

      // Add role filters if set
      if (filters.roles && filters.roles.length > 0) {
        params.roles = filters.roles.join(",");
      }

      // Add status filters if set
      if (filters.statuses && filters.statuses.length > 0) {
        params.statuses = filters.statuses.join(",");
      }

      console.log("API Request params:", params); // Debug log

      try {
        const response = await axios.get(url + "/users/all", {
          ...config,
          params,
        });

        console.log("API Response:", response.data); // Debug log

        if (response.data.meta?.pagination) {
          setTotalPages(response.data.meta.pagination.totalPages);
        } else if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages);
        }

        const users = response.data.data || response.data.users || [];

        // Additional safety check for duplicates
        const uniqueUsers = users.filter(
          (user: any, index: number, arr: any[]) =>
            arr.findIndex((u) => u.id === user.id) === index
        );

        if (users.length !== uniqueUsers.length) {
          console.warn(
            `Removed ${
              users.length - uniqueUsers.length
            } duplicate users from API response`
          );
        }

        return uniqueUsers;
      } catch (err) {
        console.error("API Error:", err);
        throw err;
      }
    },
    // Force fresh data on filter changes
    staleTime: 0, // Data is immediately stale
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const handleSearch = (value: string) => {
    if (contextValue?.setUserSearch) {
      contextValue.setUserSearch(value);
    }
    setCurrentActivePage(1);
  };

  const handleDownloadCurrent = () => {
    if (data && data.length > 0) {
      exportToCSV(data, headers, `users_current_page_${currentActivePage}.csv`);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const params: any = {
        search: contextValue?.userSearch || "",
        limit: 10000,
        sortBy: sortBy.header,
        sortOrder: sortBy.order,
      };

      if (filters.roles && filters.roles.length > 0) {
        params.roles = filters.roles.join(",");
      }
      if (filters.statuses && filters.statuses.length > 0) {
        params.statuses = filters.statuses.join(",");
      }

      const response = await axios.get(url + "/users/all", {
        ...config,
        params,
      });

      const allData = response.data.data || response.data.users || [];
      if (allData && allData.length > 0) {
        exportToCSV(allData, headers, "users_all_filtered.csv");
      }
    } catch (error) {
      console.error("Error downloading all data:", error);
      if (data && data.length > 0) {
        exportToCSV(data, headers, "users_partial.csv");
      }
    }
  };

  const handleRefresh = (onRefreshComplete: () => void) => {
    setIsRefreshing(true);
    refetch()
      .then(() => console.log("User data refreshed successfully"))
      .catch((error) => console.error("Error refreshing user data:", error))
      .finally(() => {
        setIsRefreshing(false);
        onRefreshComplete();
      });
  };

  const handleSortChange = (newSortBy: {
    header: string;
    order: "asc" | "desc";
  }) => {
    setSortBy(newSortBy);
  };

  const handlePageChange = (page: number) => {
    setCurrentActivePage(page);
  };

  const handleRowsPerPageChange = (value: number) => {
    setTotalValuesPerPage(value);
    setCurrentActivePage(1);
  };

  return (
    <ContentBox2>
      <div className="flex flex-col h-full bg-white rounded-tr-2xl rounded-tl-2xl">
        {/* Universal Toolbar with User-specific Configuration */}
        <TableToolbar
          searchEnabled={true}
          downloadEnabled={true}
          refreshEnabled={true}
          filterConfigs={userFilterConfigs}
          onSearch={handleSearch}
          onDownloadCurrent={handleDownloadCurrent}
          onDownloadAll={handleDownloadAll}
          onRefresh={handleRefresh}
          onFilterChange={handleFilterChange}
        />

        {/* Scrollable content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TableContent
            headers={headers}
            data={data || []}
            isLoading={isLoading || isRefreshing}
            error={error}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            RowComponent={UserSingleRow}
          />
        </div>

        {/* Pagination */}
        <TablePagination
          currentActivePage={currentActivePage}
          setCurrentActivePage={handlePageChange}
          totalValuesPerPage={totalValuesPerPage}
          setTotalValuesPerPage={handleRowsPerPageChange}
          totalPages={totalPages}
        />
      </div>
    </ContentBox2>
  );
};

export default UsersContent;
