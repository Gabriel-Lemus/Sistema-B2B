import React, { useState } from 'react';
import styled from '@emotion/styled';

const USER_A = {
  username: 'Alice',
  userId: 1,
}

const USER_B = {
  username: 'Bob',
  userId: 2,
}

const Wrapper = styled.div({
  position: 'absolute',
  top: 24,
  left: 24,
})

const ToggleContainer = styled.div({
  border: '3px solid black',
  borderRadius: 8,
  display: 'flex',
})

const UserButton = styled.button({
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: 4,
}, ({ isSelected }) => ({
  background: isSelected ? 'green' : 'white',
  color: isSelected ? 'white' : 'black',
}))

const UserToggle = () => {
  const [selectedUser, selectUser] = useState(USER_A)

  localStorage.setItem('currentUsername', selectedUser.username)
  localStorage.setItem('currentUserId', selectedUser.userId)

  return (
    <Wrapper>
      <p style={{ marginBottom: 12 }}>Logged in as:</p>
      <ToggleContainer>
        
        <UserButton 
          isSelected={selectedUser.userId === USER_A.userId}
          onClick={() => selectUser(USER_A)}
        >
          Alice
        </UserButton>
        <UserButton 
          isSelected={selectedUser.userId === USER_B.userId}
          onClick={() => selectUser(USER_B)}
        >
          Bob
        </UserButton>
      </ToggleContainer>
    </Wrapper>
  )
}

export default UserToggle
