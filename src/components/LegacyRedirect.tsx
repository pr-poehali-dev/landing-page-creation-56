import { useEffect } from "react";

const LegacyRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.replace(`/${to}`);
  }, [to]);
  return null;
};

export default LegacyRedirect;
