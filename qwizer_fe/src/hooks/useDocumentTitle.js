import { useEffect } from "react";

const useDocumentTitle = (title) => {
  useEffect(() => {
    document.title = title || "Qwizer";
  }, [title]);
};

export default useDocumentTitle;
