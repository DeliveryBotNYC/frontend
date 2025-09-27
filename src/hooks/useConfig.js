import useAuth from "../hooks/useAuth";
export const useConfig = () => {
    const { auth } = useAuth();
    return {
        headers: {
            Authorization: "Bearer " + auth?.accessToken,
            "Access-Control-Allow-Origin": true,
        },
    };
};
const local_url = "http://localhost:3001";
const production_url = "https://api.dbx.delivery";
export const url = local_url;
