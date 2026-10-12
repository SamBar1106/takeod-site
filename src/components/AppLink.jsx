import { Link, useSearchParams } from "react-router-dom";

export function AppLink({ to, ref, ...rest }) {
  const [params] = useSearchParams();
  const embed = params.get("embed") === "1";
  let next = to;
  if (embed && typeof to === "string" && !to.includes("embed=1")) {
    const hashIndex = to.indexOf("#");
    const hash = hashIndex >= 0 ? to.slice(hashIndex) : "";
    const path = hashIndex >= 0 ? to.slice(0, hashIndex) : to;
    next = `${path}${path.includes("?") ? "&" : "?"}embed=1${hash}`;
  }
  return <Link ref={ref} to={next} {...rest} />;
}
