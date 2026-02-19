// src/hooks/useChatwoot.ts
import { useEffect } from "react";
import useAuth from "./useAuth";

const BASE_URL = "https://support.dbx.delivery";
const WEBSITE_TOKEN = "qGM2R5VKjpo1neMbBGVegMKo";

const useChatwoot = () => {
  const { auth } = useAuth() as { auth: any };
  console.log(auth);

  useEffect(() => {
    if (!auth?.user) return;

    if (document.getElementById("chatwoot-script")) return;

    const script = document.createElement("script");
    script.id = "chatwoot-script";
    script.src = `${BASE_URL}/packs/js/sdk.js`;
    script.defer = true;
    script.async = true;

    script.onload = () => {
      (window as any).chatwootSDK.run({
        websiteToken: WEBSITE_TOKEN,
        baseUrl: BASE_URL,
      });

      window.addEventListener("chatwoot:ready", () => {
        (window as any).$chatwoot.setUser(`user-${auth.user.id}`, {
          email: auth.user.email,
          name: auth.user.company,
          phone_number: auth.user.phone,
          identifier_hash: auth.user.identifierHash,
        });
      });
    };

    document.body.appendChild(script);

    return () => {
      (window as any).$chatwoot?.toggleBubbleVisibility?.("hide");
    };
  }, [auth?.user]);
};

export default useChatwoot;
