import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (to) => navigate(to),
    replace: (to) => navigate(to, { replace: true }),
    back: () => navigate(-1),
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParamsCompat() {
  const [params] = useSearchParams();
  return params;
}

export { useSearchParamsCompat as useSearchParams };

export function redirect(to) {
  if (typeof window !== "undefined") {
    window.location.replace(to);
  }
  return null;
}
