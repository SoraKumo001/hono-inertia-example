import { useEffect } from 'react';
import { useDispatch, useSelector } from './context';

export const Counter = () => {
  const count = useSelector((state: { count: number }) => state.count);
  const dispatch = useDispatch<{ count: number }>();
  useEffect(() => {
    const handle = setInterval(() => {
      dispatch((v) => ({ ...v, count: v.count + 1 }));
    }, 1000);
    return () => clearInterval(handle);
  }, []);
  return <div>count:{count}</div>;
};
