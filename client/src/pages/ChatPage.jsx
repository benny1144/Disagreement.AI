import { useEffect, useState, useRef } from 'react';
import { Grid, GridItem, Box, Text, Spinner, Heading, VStack, Flex, Input, Button } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import InviteUserModal from '../components/InviteUserModal.jsx';

function ChatPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [disagreement, setDisagreement] = useState({ text: '', messages: [] });
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef(null);
  // Current user id from localStorage (safe parse)
  const currentUserId = (() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      const user = JSON.parse(stored);
      return user?._id || user?.id || null;
    } catch (e) {
      return null;
    }
  })();

  // Invite modal visibility (local state to avoid Chakra v3 hook differences)
  const [isInviteOpen, setInviteOpen] = useState(false);
  const onOpen = () => setInviteOpen(true);
  const onClose = () => setInviteOpen(false);

  useEffect(() => {
    const fetchDisagreement = async () => {
      try {
        setIsLoading(true);
        setError('');

        const stored = localStorage.getItem('user');
        if (!stored) {
          setError('Not authenticated');
          setIsLoading(false);
          return;
        }
        const user = JSON.parse(stored);

        const res = await axios.get(`http://localhost:3000/api/disagreements/${id}` , {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        // Ensure messages is an array
        const data = res.data || {};
        data.messages = Array.isArray(data.messages) ? data.messages : [];
        setDisagreement(data);
      } catch (err) {
        const message =
          (err && err.response && err.response.data && err.response.data.message) ||
          err?.message ||
          'Failed to load disagreement';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDisagreement();
  }, [id]);

  // Real-time Socket.IO connection
  useEffect(() => {
    if (!id) return;

    const socket = io('http://localhost:3000', {
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    // Join the room for this disagreement
    const handleConnect = () => {
      socket.emit('join_room', { roomId: id });
    };

    socket.on('connect', handleConnect);

    // Listen for new incoming messages and append
    const handleReceive = (data) => {
      setDisagreement((prev) => {
        const prevMsgs = Array.isArray(prev.messages) ? prev.messages : [];
        return { ...prev, messages: [...prevMsgs, data] };
      });
    };

    socket.on('receive_message', handleReceive);

    // Cleanup on unmount / id change
    return () => {
      socket.off('connect', handleConnect);
      socket.off('receive_message', handleReceive);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [id]);

  const handleSendMessage = async () => {
    const text = (newMessage || '').trim();
    if (!text) return;
    if (!socketRef.current) return;
    const payload = { roomId: id, sender: currentUserId, text };
    socketRef.current.emit('send_message', payload);
    setNewMessage('');
  };

  return (
    <Grid
      templateColumns={{ base: '1fr', md: '300px 1fr' }}
      minH="100vh"
      gap={{ base: 0, md: 6 }}
      bg="gray.50"
      px={{ base: 4, md: 8 }}
      py={{ base: 4, md: 6 }}
    >
      {/* Sidebar panel (future list of disagreements) */}
      <GridItem
        bg="gray.50"
        borderRightWidth={{ md: '1px' }}
        borderColor="gray.200"
        p={{ base: 0, md: 0 }}
      >
        <Box bg="white" borderRadius={{ md: 'xl' }} boxShadow={{ md: 'sm' }} p={4} minH={{ md: '100%' }}>
          <Text color="gray.500">Sidebar — Disagreements List (placeholder)</Text>
        </Box>
      </GridItem>

      {/* Main content panel (active chat) */}
      <GridItem>
        <Box bg="white" borderRadius="xl" boxShadow="sm" p={6} minH="100%">
          {isLoading ? (
            <Box display="flex" alignItems="center" justifyContent="center" minH="200px">
              <Spinner size="lg" thickness="3px" color="blue.500" />
            </Box>
          ) : error ? (
            <Text color="red.500" fontWeight="medium">{error}</Text>
          ) : (
            <VStack align="stretch" spacing={4}>
              <Flex align="center" justify="space-between">
                <Heading size="md" color="gray.700">{disagreement.text || 'Disagreement'}</Heading>
                <Button colorScheme="blue" onClick={onOpen}>Invite</Button>
              </Flex>
              {disagreement.messages.length === 0 ? (
                <Text color="gray.500">No messages yet.</Text>
              ) : (
                disagreement.messages.map((msg, idx) => {
                  const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
                  const isMine = currentUserId && senderId && String(senderId) === String(currentUserId);
                  return (
                    <Flex key={msg._id || idx} justifyContent={isMine ? 'flex-end' : 'flex-start'}>
                      <Box
                        bg={isMine ? 'blue.500' : 'gray.100'}
                        color={isMine ? 'white' : 'gray.800'}
                        px={4}
                        py={2}
                        borderRadius="xl"
                        maxW="75%"
                        boxShadow="sm"
                      >
                        <Text>{msg.text}</Text>
                      </Box>
                    </Flex>
                  );
                })
              )}

              {/* Legal disclaimer, persistently visible above input */}
              <Text fontSize="sm" fontStyle="italic" color="gray.500" mt={2}>
                Please note: The AI does not provide legally binding advice.
              </Text>

              {/* Message input form */}
              <Flex as="form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} gap={2} mt={2}>
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button colorScheme="blue" type="submit" onClick={handleSendMessage}>
                  Send
                </Button>
              </Flex>
            </VStack>
          )}
        
          {/* Invite User Modal */}
          <InviteUserModal isOpen={isInviteOpen} onClose={onClose} disagreementId={id} />
        </Box>
      </GridItem>
    </Grid>
  );
}

export default ChatPage;
