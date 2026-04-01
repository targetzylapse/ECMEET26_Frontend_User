import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

export const identifyUser = (userId) => {
  if (userId) {
    socket.emit('identify', userId);
  }
};

export default socket;
