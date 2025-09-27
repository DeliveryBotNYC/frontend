import { useParams } from "react-router-dom";
import AdminUserContent from "./AdminUserContent";
import DriverUserContent from "./DriverUserContent";
import RetailUserContent from "./RetailUserContent";
import ContentBox2 from "../reusable/ContentBox2";
import { Link } from "react-router-dom";
import BackIcon from "../../assets/arrow-back.svg";

const SingleUserContent = () => {
  const { userType, id } = useParams();

  if (!id || !userType) {
    return (
      <ContentBox2>
        <div className="w-full h-full flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-red-600 mb-4">
            Missing Parameters
          </h2>
          <p className="text-gray-600 mb-4">
            UserType: {userType || "missing"}, ID: {id || "missing"}
          </p>
          <Link to="/users">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
              <img src={BackIcon} alt="prev-icon" />
              <span className="font-medium">Back to Users</span>
            </button>
          </Link>
        </div>
      </ContentBox2>
    );
  }

  // Route to specific user type component
  switch (userType) {
    case "admin":
      return <AdminUserContent userId={id} />;
    case "driver":
      return <DriverUserContent userId={id} />;
    case "retail":
      return <RetailUserContent userId={id} />;
    default:
      return (
        <ContentBox2>
          <div className="w-full h-full flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-red-600 mb-4">
              Invalid User Type
            </h2>
            <p className="text-gray-600 mb-4">Unknown user type: {userType}</p>
            <Link to="/users">
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
                <img src={BackIcon} alt="prev-icon" />
                <span className="font-medium">Back to Users</span>
              </button>
            </Link>
          </div>
        </ContentBox2>
      );
  }
};

export default SingleUserContent;
