import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 2,   // 2 min
      gcTime:             1000 * 60 * 10,  // 10 min
      retry:              1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (err) => {
        console.error('[mutation error]', err?.response?.data?.message || err.message);
      },
    },
  },
});
