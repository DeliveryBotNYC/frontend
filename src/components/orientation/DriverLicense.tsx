import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { url } from "../../hooks/useConfig";

const DriverLicense = ({ token, setStep }) => {
  const [error, setError] = useState({});
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: Array) =>
      axios.patch(url + "/driver/v3/profile", newTodo, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: (data) => {
      setItems(data.data?.data?.items);
    },
    onError: (err) => {
      setError(err.response?.data?.message || "An error occurred");
    },
  });

  return (
    <div className="flex flex-col h-screen pt-24 px-4 text-white pb-36 "></div>
  );
};

export default DriverLicense;
