import React from 'react';

const UsernameDisplay: React.FC = () => {
  let user: any = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    user = {};
  }
  const displayName = user?.username || user?.name || user?.fullName || "Anonymous User";
  return <span>{displayName}</span>;
};

export default UsernameDisplay; 