/**
 * Mock for Peer Support Service
 */

export const peerSupportService = {
  connectToPeer: jest.fn().mockResolvedValue({ peerId: 'mock-peer-123', status: 'connected' }),
  disconnectFromPeer: jest.fn().mockResolvedValue(undefined),
  sendMessage: jest.fn().mockResolvedValue({ messageId: 'mock-msg-123', delivered: true }),
  getActivePeers: jest.fn().mockResolvedValue([]),
  getPeerProfile: jest.fn().mockResolvedValue({
    id: 'mock-peer-123',
    name: 'Test Peer',
    isAvailable: true,
    specialties: ['anxiety', 'depression']
  }),
  searchPeers: jest.fn().mockResolvedValue([]),
  reportPeer: jest.fn().mockResolvedValue({ reported: true }),
  blockPeer: jest.fn().mockResolvedValue({ blocked: true }),
  getBlockedPeers: jest.fn().mockResolvedValue([]),
  unblockPeer: jest.fn().mockResolvedValue({ unblocked: true }),
  joinGroup: jest.fn().mockResolvedValue({ groupId: 'mock-group-123', joined: true }),
  leaveGroup: jest.fn().mockResolvedValue({ left: true }),
  getGroups: jest.fn().mockResolvedValue([]),
  createGroup: jest.fn().mockResolvedValue({ groupId: 'new-group-123', created: true }),
  getPeerStatus: jest.fn().mockReturnValue('available'),
  updateStatus: jest.fn().mockResolvedValue({ updated: true }),
  getMessageHistory: jest.fn().mockResolvedValue([]),
  clearMessageHistory: jest.fn().mockResolvedValue({ cleared: true })
};