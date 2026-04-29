import {
  useRef,
  useSyncExternalStore,
  createContext,
  ReactNode,
  useContext,
} from 'react';

export type ContextType<T> = {
  state: T;
  storeChanges: Set<() => void>;
  dispatch: (callback: (state: T) => T) => void;
  subscribe: (onStoreChange: () => void) => () => void;
};

export const createStoreContext = <T,>(s: T) => {
  const context = useRef<ContextType<T>>({
    state: s,
    storeChanges: new Set(),
    dispatch: (callback) => {
      context.state = callback(context.state);
      context.storeChanges.forEach((storeChange) => storeChange());
      globalState = context.state as never;
    },
    subscribe: (onStoreChange) => {
      context.storeChanges.add(onStoreChange);
      return () => {
        context.storeChanges.delete(onStoreChange);
      };
    },
  }).current;
  return context;
};

const StoreContext = createContext<ContextType<any>>(undefined as never);

var globalState: Record<string, unknown> | undefined;

export const StoreProvider = <T extends Record<string, unknown>>({
  children,
  initState,
}: {
  children: ReactNode;
  initState: () => T;
}) => {
  if (!globalState) {
    globalState = Object.assign({}, initState());
  }

  const context = createStoreContext(globalState);
  return (
    <StoreContext.Provider value={context}>{children}</StoreContext.Provider>
  );
};

export const useSelector = <T, R>(getSnapshot: (state: T) => R) => {
  const context = useContext<ContextType<T>>(StoreContext);
  return useSyncExternalStore(
    context.subscribe,
    () => getSnapshot(context.state),
    () => getSnapshot(context.state),
  );
};

export const useDispatch = <T,>() => {
  const context = useContext<ContextType<T>>(StoreContext);
  return context.dispatch;
};
