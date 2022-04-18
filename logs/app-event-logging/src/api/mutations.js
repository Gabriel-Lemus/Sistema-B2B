import { gql } from '@apollo/client';

export const UPDATE_TODO = gql`
  mutation UpdateTodo($input: UpdateTodoInput!) {
    updateTodo(input: $input) {
      _id
      description
      isDone
    }
  }
`;

export const CREATE_TODO = gql`
  mutation CreateTodo {
    createTodo {
      _id
      description
      isDone
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($input: DeleteTodoInput!) {
    deleteTodo(input: $input) {
      _id
      description
      isDone
    }
  }
`;
