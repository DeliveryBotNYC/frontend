import { Link } from 'react-router-dom'

interface ordeDropdownPropsType {
  orderId: string
  dropdownRef: React.RefObject<HTMLDivElement>
  closeDropdown: () => void
}

const OrderDropdown = ({
  orderId,
  dropdownRef,
  closeDropdown,
}: ordeDropdownPropsType) => {
  return (
    <div
      ref={dropdownRef}
      className="w-max bg-white rounded-lg absolute z-50 right-16 top-16 shadow-dropdownShadow"
    >
      {/* View Tracking Btn */}
      <div className="px-6 py-3">
        <Link to={`tracking/${orderId}`}>
          <p className="text-xs cursor-pointer">View tracking</p>
        </Link>
      </div>

      {/* Cancle Order Btn */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <p className="text-xs cursor-pointer">Cancel order</p>
      </div>

      {/* View Order Details Btn */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <p className="text-xs cursor-pointer">View order details</p>
      </div>

      {/* Duplicate Orders Btn */}
      <div className="px-6 py-3" onClick={closeDropdown}>
        <p className="text-xs cursor-pointer">Duplicate order</p>
      </div>

      {/* Arrow */}
      <div className="w-4 h-4 bg-white shadow-btnShadow rotate-[-135deg] absolute -top-2 right-6"></div>
    </div>
  )
}

export default OrderDropdown
