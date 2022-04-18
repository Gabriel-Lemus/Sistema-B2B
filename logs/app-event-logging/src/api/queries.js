import { gql } from '@apollo/client';

export const GET_TODOS = gql`
  query GetTodos {
    todos {
      _id
      description
      isDone
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents {
    events {
      _id 
      timestamp 
      userId  
      username  
      action  
      entityId  
      deltas  
    }
  }
`;

