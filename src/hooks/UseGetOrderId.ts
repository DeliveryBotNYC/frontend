import { useLocation } from "react-router-dom";

const UseGetOrderId = (): string => {
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  return pathSegments[pathSegments.length - 1];
};

export default UseGetOrderId;
