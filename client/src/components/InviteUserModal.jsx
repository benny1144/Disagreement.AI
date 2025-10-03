import { useState, useEffect } from 'react';
import { Box, Button, Input, Text, VStack, Flex } from '@chakra-ui/react';
import axios from 'axios';

/**
 * InviteUserModal
 *
 * Props:
 * - isOpen: boolean — controls visibility
 * - onClose: function — called to close the modal
 * - disagreementId?: string — optional; passed through for handlers
 * - onSend?: function(email: string, disagreementId?: string) — optional callback after successful invite
 */
function InviteUserModal({ isOpen, onClose, disagreementId, onSend }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) setEmail('');
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const trimmed = (email || '').trim();
    if (!trimmed) {
      if (typeof window !== 'undefined') {
        window.alert("Please enter the user's email address.");
      }
      return;
    }

    // Read auth token
    let token = null;
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        token = user?.token;
      }
    } catch {}

    if (!token) {
      if (typeof window !== 'undefined') {
        window.alert('You must be logged in to send an invite.');
      }
      return;
    }

    try {
      setSubmitting(true);
      const url = `http://localhost:3000/api/disagreements/${disagreementId}/invite`;
      await axios.post(
        url,
        { email: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (typeof window !== 'undefined') {
        window.alert('Invitation sent successfully.');
      }

      if (typeof onSend === 'function') {
        try { onSend(trimmed, disagreementId); } catch {}
      }

      if (typeof onClose === 'function') onClose();
    } catch (error) {
      const message =
        (error && error.response && error.response.data && error.response.data.message) ||
        error?.message ||
        'Failed to send invite';
      if (typeof window !== 'undefined') {
        window.alert(`Invite failed: ${message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box position="fixed" top="0" right="0" bottom="0" left="0" zIndex={1100}>
      {/* Backdrop */}
      <Box position="absolute" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.45)" onClick={onClose} />

      {/* Modal Panel */}
      <Flex position="absolute" top="0" right="0" bottom="0" left="0" align="center" justify="center" p={4}>
        <Box as="form" onSubmit={handleSubmit} bg="white" borderRadius="xl" boxShadow="xl" w="100%" maxW="md" p={6}>
          <Flex align="center" justify="space-between" mb={4}>
            <Text as="h2" fontSize="xl" fontWeight="semibold">Invite Someone to this Disagreement</Text>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </Flex>

          <VStack align="stretch" spacing={3}>
            <Text fontWeight="medium">User's Email</Text>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </VStack>

          <Flex justify="flex-end" gap={3} mt={6}>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button colorScheme="blue" type="submit" isDisabled={submitting} isLoading={submitting}>Send Invite</Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default InviteUserModal;
