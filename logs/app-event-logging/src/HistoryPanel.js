import React from 'react';
import styled from '@emotion/styled';
import { useQuery } from '@apollo/client';

import { GET_EVENTS } from './api/queries'

const Panel = styled.div({
  height: '70%',
  width: 300,
  border: '1px solid black',
  overflowY: 'auto',
  padding: '0 24px',
});

const TopBar = styled.div({
  position: 'sticky',
  top: 0,
  background: 'white',
  padding: '24px 0',
})

const Card = styled.div({
  marginBottom: 12,
  border: '1px solid black',
  padding: 12,
})

const Timestamp = styled.div({
  fontSize: 10,
})

const PersonActionLabel = styled.div({
  margin: '8px 0',
})

const Diff = ({ deltas }) => (
  deltas.map(({ field, before, after }) => (
    <div key={field} style={{ fontSize: 10 }}>
      <span>{field}:</span>{' '}
      <span>{String(before) || 'null'}</span>{' '}
      <span>→</span>{' '}
      <span>{String(after) || 'null'}</span>
    </div>
  ))
)

const HistoryPanel = () => {
  const { loading, error, data } = useQuery(GET_EVENTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <Panel>
      <TopBar>
        <h1>Event History</h1>
      </TopBar>
      {
        data.events.map(({
          timestamp, 
          userId,  
          username,  
          action,  
          entityId,  
          deltas,  
        }) => (
          <Card>
            <Timestamp>{new Date(timestamp).toLocaleString()}</Timestamp>
            <PersonActionLabel>
              {username} {action} <span title={entityId}>todo</span>
            </PersonActionLabel>
            <div>
              {
                action === 'created'
                  || (action === 'updated' && <Diff deltas={deltas} />)
                  || (action === 'deleted' && <Diff deltas={deltas} />)
              }
            </div>
          </Card>
        ))
      }
    </Panel>
  )
}

export default HistoryPanel
