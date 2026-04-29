import { useEffect } from 'react';
import { useDispatch, useSelector } from './context';

export const Counter = () => {
  const count = useSelector((state: { count: number }) => state.count);
  const dispatch = useDispatch<{ count: number }>();
  useEffect(() => {
    setInterval(() => {
      dispatch((v) => ({ ...v, count: v.count + 1 }));
    }, 1000);
  }, []);
  return <div>count:{count}</div>;
};
