import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';

export * from '@tanstack/react-query';

let queryClient: QueryClient;

if (typeof window.__react_query_client === 'undefined') {
  queryClient = new QueryClient();
} else {
  queryClient = window.__react_query_client;
}

const QueryClientProvider: React.FC = ({ children }) => {
  return createElement(ReactQueryClientProvider, { client: queryClient }, children);
};

export { QueryClientProvider, queryClient };

declare global {
  interface Window {
    __react_query_client?: QueryClient;
  }
}
