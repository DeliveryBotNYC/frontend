import { useLocation } from "react-router-dom";

export const useConfig = () => {
  const { pathname } = useLocation();
  const pathSegments = pathname.split("/");
  return {
    headers: {
      Authorization: "Bearer " + pathSegments[pathSegments.length - 1],
    },
  };
};
