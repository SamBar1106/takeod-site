import { useEffect } from "react";

export function Missing() {
  useEffect(() => {
    document.title = "PLACEHOLDER — Page | Daykodee";
  }, []);

  return (
    <section className="section info">
      <div className="section__stage">
        <div className="wrap">
          <h1>PLACEHOLDER — Page</h1>
        </div>
      </div>
    </section>
  );
}
