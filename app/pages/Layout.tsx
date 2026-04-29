import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { StoreProvider } from '../components/context';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <StoreProvider initState={() => ({ count: 0 })}>
      <div className='app'>
        <header>
          <nav>
            <Link href='/'>Home</Link>
            {' | '}
            <Link href='/users'>Users</Link>
          </nav>
        </header>
        <main>{children}</main>
      </div>
    </StoreProvider>
  );
}
