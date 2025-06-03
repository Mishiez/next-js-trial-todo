// src/pages/_app.tsx
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";

// Initialize Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:8000/graphql/", // Your backend GraphQL endpoint
  cache: new InMemoryCache(),
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}