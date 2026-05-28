import { useEffect, useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const handle = setInterval(() => {
      setCount((v) => v + 1);
    }, 1000);
    return () => clearInterval(handle);
  }, []);
  return <div>count:{count}</div>;
};
