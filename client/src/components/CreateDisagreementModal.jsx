import { useState, useEffect } from 'react';
import { Box, Button, Input, VStack, Text, Flex } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * CreateDisagreementModal
 *
 * Props:
 * - isOpen: boolean — controls modal visibility
 * - onClose: function — called to close the modal
 * - onCreate?: function({ title, role }) — optional callback after create
 * - initialTitle?: string — optional prefill for title
 * - initialRole?: 'Mediator' | 'Fact-Finder' | 'Judge & Jury' — optional prefill for role
 */
function CreateDisagreementModal({ isOpen, onClose, onCreate, initialTitle = '', initialRole = 'Mediator' }) {
  const [title, setTitle] = useState(initialTitle);
  const [role, setRole] = useState(initialRole);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset form whenever the modal is opened
    if (isOpen) {
      setTitle(initialTitle || '');
      setRole(initialRole || 'Mediator');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const trimmed = (title || '').trim();
    if (!trimmed) {
      // Keep UX minimal and version-agnostic
      if (typeof window !== 'undefined') {
        window.alert('Please enter a title for your disagreement.');
      }
      return;
    }

    // Read auth token from localStorage
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
        window.alert('You must be logged in to create a disagreement.');
      }
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(
        'http://localhost:3000/api/disagreements',
        { text: trimmed }, // API expects text; role captured for future use
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const created = res?.data;
      const newId = created?._id || created?.id;

      // Optional external callback
      if (typeof onCreate === 'function') {
        try { onCreate({ title: trimmed, role, created }); } catch {}
      }

      if (typeof onClose === 'function') onClose();

      if (newId) {
        navigate(`/disagreement/${newId}`);
      } else if (typeof window !== 'undefined') {
        window.alert('Created, but could not navigate to the new disagreement.');
      }
    } catch (error) {
      const message =
        (error && error.response && error.response.data && error.response.data.message) ||
        error?.message ||
        'Failed to create disagreement';
      if (typeof window !== 'undefined') {
        window.alert(`Create failed: ${message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box position="fixed" top="0" right="0" bottom="0" left="0" zIndex={1000}>
      {/* Backdrop */}
      <Box position="absolute" top="0" right="0" bottom="0" left="0" bg="rgba(0,0,0,0.45)" onClick={onClose} />

      {/* Modal Panel */}
      <Flex position="absolute" top="0" right="0" bottom="0" left="0" align="center" justify="center" p={4}>
        <Box as="form" onSubmit={handleSubmit} bg="white" borderRadius="xl" boxShadow="xl" w="100%" maxW="lg" p={6}>
          <Flex align="center" justify="space-between" mb={4}>
            <Text as="h2" fontSize="xl" fontWeight="semibold">Start a New Disagreement</Text>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </Flex>

          <VStack align="stretch" spacing={4}>
            {/* Title field */}
            <VStack align="stretch" spacing={1}>
              <Text fontWeight="medium">Title</Text>
              <Input
                placeholder="e.g., Project Scope Discussion"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </VStack>

            {/* AI Role select */}
            <VStack align="stretch" spacing={1}>
              <Text fontWeight="medium">Select AI Role</Text>
              <Box as="select" value={role} onChange={(e) => setRole(e.target.value)} required borderWidth="1px" borderRadius="md" p={2}>
                <option value="Mediator">Mediator</option>
                <option value="Fact-Finder">Fact-Finder</option>
                <option value="Judge & Jury">Judge & Jury</option>
              </Box>
            </VStack>
          </VStack>

          <Flex justify="flex-end" gap={3} mt={6}>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button colorScheme="blue" type="submit" isDisabled={submitting} isLoading={submitting}>Create</Button>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}

export default CreateDisagreementModal;
