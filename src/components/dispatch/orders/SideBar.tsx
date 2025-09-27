import { useState, useEffect, useContext } from "react";
import SearchIcon from "../../../assets/search.svg";
import StopCard from "./StopCard";
import RouteInfo from "./RouteInfo";
import { ThemeContext } from "../../../context/ThemeContext";
import { useConfig, url } from "../../../hooks/useConfig";

// Import the new hooks
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useOrderFiltering } from "../hooks/useOrderFiltering";
import { useOrderOperations } from "../hooks/useOrderOperations";
import { useOrderValidation } from "../hooks/useOrderValidation";

// Define proper interfaces for better type safety
interface Order {
  id: string;
  customer_id: string;
  o_order: string;
  // Add other order properties as needed
}

interface Stop {
  customer_id: string;
  o_order: string;
  orders?: Order[];
  // Add other stop properties as needed
}

interface Route {
  id?: string;
  orders: Stop[];
  // Add other route properties as needed
}

interface Driver {
  id: string;
  name: string;
  // Add other driver properties as needed
}

interface DraggedOrder {
  order: Order;
  orderType: string;
}

interface DraggedItem {
  index: number;
  // Add other dragged item properties as needed
}

interface SideBarProps {
  route: Route | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  hoveredStopId: string | null;
  onStopHover: (stopId: string | null) => void;
  expandedStopId: string | null;
  onStopExpand: (stopId: string) => void;
  onRouteUpdate: (updatedRoute: Route, originalRoute?: Route) => Promise<Route>;
  onFilteredOrdersChange: (orders: Stop[] | null) => void;
  availableDrivers: Driver[];
  unassignedOrders: Order[];
  isUnassignedOrdersLoading: boolean;
}

// Custom event type for order drag start
interface OrderDragStartEvent extends CustomEvent {
  detail: DraggedOrder;
}

const SideBar: React.FC<SideBarProps> = ({
  route,
  searchTerm,
  setSearchTerm,
  isLoading,
  hoveredStopId,
  onStopHover,
  expandedStopId,
  onStopExpand,
  onRouteUpdate,
  onFilteredOrdersChange,
  availableDrivers,
  unassignedOrders,
  isUnassignedOrdersLoading,
}) => {
  const config = useConfig();
  const { clearOrderSelection } = useContext(ThemeContext);

  // Local state for ordered items with proper typing
  const [orderedItems, setOrderedItems] = useState<Stop[]>([]);

  // Initialize ordered items when route changes
  useEffect(() => {
    if (route?.orders && Array.isArray(route.orders)) {
      setOrderedItems(route.orders);
    } else {
      console.warn("route.orders is not a valid array:", route?.orders);
      setOrderedItems([]);
    }
  }, [route?.orders]);

  // Initialize validation hook
  const validation = useOrderValidation(orderedItems);

  // Initialize order operations hook
  const operations = useOrderOperations(
    orderedItems,
    setOrderedItems,
    route,
    url,
    config,
    onRouteUpdate
  );

  // Initialize filtering hook
  const filtering = useOrderFiltering(orderedItems, searchTerm, onStopExpand);

  // Initialize drag and drop hook
  const dragAndDrop = useDragAndDrop(
    orderedItems,
    operations.handleStopReorder,
    operations.mergeOrderIntoStop,
    operations.createNewStopFromOrder,
    validation.findStopByOrder,
    validation.checkDropOnSameStop
  );

  // Listen for order drag start events from individual order cards
  useEffect(() => {
    const handleOrderDragStart = (e: Event) => {
      const customEvent = e as OrderDragStartEvent;
      dragAndDrop.setDraggedOrder(customEvent.detail);
    };

    document.addEventListener("orderDragStart", handleOrderDragStart);
    return () => {
      document.removeEventListener("orderDragStart", handleOrderDragStart);
    };
  }, [dragAndDrop.setDraggedOrder]);

  // Pass filtered orders to parent for map display
  useEffect(() => {
    if (onFilteredOrdersChange) {
      onFilteredOrdersChange(filtering.filteredOrdersForMap);
    }
  }, [filtering.filteredOrdersForMap, onFilteredOrdersChange]);

  // Handle expansion toggle - only one stop can be open at a time
  const handleToggleExpansion = (stopId: string) => {
    if (onStopExpand) {
      onStopExpand(stopId);
    }
    if (clearOrderSelection) {
      clearOrderSelection(null);
    }
  };

  // Determine if drop is valid for visual feedback
  const getDropValidation = (index: number): boolean => {
    const dragData = {
      draggedOrder: dragAndDrop.draggedOrder,
      draggedItem: dragAndDrop.draggedItem,
    };
    return validation.isDropValid(dragData, index);
  };

  // Get visual drop indicator for current drag state
  const getDropIndicator = (index: number): string => {
    if (dragAndDrop.dragOverIndex !== index) return "";

    const isDragValid = getDropValidation(index);

    if (dragAndDrop.draggedItem) {
      // Stop being dragged
      return isDragValid
        ? "border-t-4 border-blue-500 bg-blue-50"
        : "border-t-4 border-red-500 bg-red-50";
    } else if (dragAndDrop.draggedOrder) {
      // Order being dragged
      if (!isDragValid) {
        return "border-2 border-red-500 bg-red-50 cursor-not-allowed";
      }

      const targetStop = orderedItems[index];
      if (
        targetStop?.customer_id === dragAndDrop.draggedOrder.order.customer_id
      ) {
        return "border-2 border-orange-500 bg-orange-50"; // Merge indicator
      } else {
        return "border-t-4 border-blue-500 bg-blue-50"; // New stop indicator
      }
    }

    return "";
  };

  // Get drag overlay content for visual feedback
  const getDragOverlay = (index: number): JSX.Element | null => {
    if (dragAndDrop.dragOverIndex !== index) return null;

    const isDragValid = getDropValidation(index);

    if (dragAndDrop.draggedItem?.index === index) return null;

    if (dragAndDrop.draggedItem) {
      // Stop being dragged
      return (
        <div
          className={`absolute -top-2 left-1/2 transform -translate-x-1/2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20 ${
            isDragValid ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isDragValid ? index + 1 : "✕"}
        </div>
      );
    } else if (dragAndDrop.draggedOrder) {
      // Order being dragged
      if (!isDragValid) {
        return (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold z-20">
            ✕ NOT ALLOWED
          </div>
        );
      }

      if (
        validation.checkDropOnSameStop(
          dragAndDrop.draggedOrder.order,
          dragAndDrop.draggedOrder.orderType,
          index
        )
      ) {
        return null; // Same stop, no indicator needed
      }

      const targetStop = orderedItems[index];
      if (
        targetStop?.customer_id === dragAndDrop.draggedOrder.order.customer_id
      ) {
        return (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-xs rounded-full px-2 py-1 font-bold z-20">
            MERGE
          </div>
        );
      } else {
        return (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20">
            {index + 1}
          </div>
        );
      }
    }

    return null;
  };

  // Get bottom drop zone validation and styling
  const getBottomDropZone = (): JSX.Element | null => {
    if (!dragAndDrop.isDraggingOverContainer) return null;

    const dragData = {
      draggedOrder: dragAndDrop.draggedOrder,
      draggedItem: dragAndDrop.draggedItem,
    };
    const isBottomDropValid = validation.isDropValid(
      dragData,
      orderedItems.length
    );

    return (
      <div className="relative">
        <div
          className={`h-1 transition-all duration-200 ${
            isBottomDropValid ? "bg-blue-500" : "bg-red-500"
          }`}
        ></div>
        <div
          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20 ${
            isBottomDropValid ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {isBottomDropValid ? orderedItems.length + 1 : "✕"}
        </div>
      </div>
    );
  };

  // Handle drag events with proper typing
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: Stop,
    index: number
  ) => {
    if (!validation.isStopLocked(item)) {
      dragAndDrop.handleDragStart(e, item, index);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    dragAndDrop.handleDragOver(e);
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    dragAndDrop.handleDragEnter(e, index);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    dragAndDrop.handleDragLeave(e);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragAndDrop.handleDrop(e, index);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    dragAndDrop.handleDragEnd(e);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Route Info Section - Fixed at top */}
      <div className="flex-shrink-0">
        <RouteInfo
          route={route}
          availableDrivers={availableDrivers}
          onRouteChange={onRouteUpdate}
          unassignedOrders={unassignedOrders}
        />
      </div>

      {/* SearchBox - Fixed at top */}
      <div className="p-4 flex-shrink-0">
        <div className="border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
          <img src={SearchIcon} width={16} alt="searchbox" />
          <input
            type="text"
            className="bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out w-full"
            placeholder="Search by order id or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List - Scrollable Section */}
      <div className="flex-1 min-h-0">
        <div
          className={`orders-list h-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-500 relative ${
            dragAndDrop.isDraggingOverContainer ? "pb-8" : ""
          }`}
          onDragOver={dragAndDrop.handleContainerDragOver}
          onDragEnter={dragAndDrop.handleContainerDragEnter}
          onDragLeave={dragAndDrop.handleContainerDragLeave}
          onDrop={dragAndDrop.handleContainerDrop}
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading orders...
            </div>
          ) : orderedItems.length > 0 ? (
            <>
              {filtering.filteredStops.map((item, index) => {
                const stopId = `${item.customer_id}-${item.o_order}`;
                const isHovered = hoveredStopId === stopId;
                const isDragged = dragAndDrop.draggedItem?.index === index;

                return (
                  <div
                    key={stopId}
                    draggable={!validation.isStopLocked(item)}
                    onDragStart={(e) => handleDragStart(e, item, index)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    data-stop-item
                    className={`
                      relative ${
                        validation.isStopLocked(item)
                          ? "cursor-default"
                          : "cursor-move"
                      }
                      ${getDropIndicator(index)}
                      ${isDragged ? "opacity-30 scale-95" : ""}
                      transition-all duration-200 ease-in-out
                    `}
                  >
                    {/* Drag feedback overlays */}
                    {isDragged && !validation.isStopLocked(item) && (
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold z-20">
                        {index + 1}
                      </div>
                    )}

                    {getDragOverlay(index)}

                    <StopCard
                      item={item}
                      isExpanded={
                        expandedStopId === stopId ||
                        filtering.searchExpandedStops.has(stopId)
                      }
                      onToggle={handleToggleExpansion}
                      isHovered={isHovered}
                      onHover={onStopHover}
                      onRemoveOrder={operations.handleRemoveOrder}
                    />
                  </div>
                );
              })}

              {/* Bottom drop zone */}
              {getBottomDropZone()}
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No orders found.
            </div>
          )}

          {/* Loading indicator for remove operations */}
          {operations.isRemovingOrder && (
            <div className="absolute top-0 left-0 right-0 bg-blue-50 border-b border-blue-200 p-2 text-center">
              <span className="text-sm text-blue-600">
                Removing order from route...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
