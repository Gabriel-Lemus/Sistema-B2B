import React from 'react';
import styled from '@emotion/styled';
import TodosPanel from './TodosPanel';
import HistoryPanel from './HistoryPanel';
import UserToggle from './UserToggle';
import './index.css';

import { 
  ApolloClient, 
  createHttpLink, 
  InMemoryCache, 
  ApolloProvider 
} from '@apollo/client';

import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/',
});

const headersLink = setContext((_, { headers }) => {
  const username = localStorage.getItem('currentUsername');
  const userId = localStorage.getItem('currentUserId');

  return {
    headers: {
      ...headers,
      user_info: JSON.stringify({ username, userId: Number(userId) }),
    }
  }
});

const TodosPage = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 24,
  height: '100vh',
})

const client = new ApolloClient({
  link: headersLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <TodosPage>
        <UserToggle />
        <TodosPanel />
        <HistoryPanel />
      </TodosPage>
    </ApolloProvider>
  );
}

export default App;
