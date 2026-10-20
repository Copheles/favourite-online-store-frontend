import { Navigate } from "react-router-dom";

/** Legacy route — catalog lives on /stock */
export function ProductsPage() {
  return <Navigate to="/stock" replace />;
}
