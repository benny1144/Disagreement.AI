import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, Flex, Button, Spinner } from '@chakra-ui/react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import authService from '../features/auth/authService.js';
import CreateDisagreementModal from '../components/CreateDisagreementModal.jsx';

function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [disagreements, setDisagreements] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
    const onOpen = () => setModalOpen(true);
    const onClose = () => setModalOpen(false);

  // Auth guard: redirect to /login if no user found or malformed user data
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        navigate('/login', { replace: true });
        return;
      }
      // Validate JSON
      JSON.parse(stored);
    } catch {
      // Malformed user data in storage; clear and redirect
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch disagreements for the logged-in user
  useEffect(() => {
    const fetchData = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) return; // The auth guard will redirect
      const user = JSON.parse(stored);

      try {
        setIsLoading(true);
        setError('');
        const res = await axios.get('http://localhost:3000/api/disagreements', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setDisagreements(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const message =
          (err && err.response && err.response.data && err.response.data.message) ||
          err?.message ||
          'Failed to load disagreements';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };


  return (
    <Box minH="100vh" bg="gray.50" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      <VStack maxW="5xl" mx="auto" spacing={8} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Heading size="xl" letterSpacing="tight">Your Dashboard</Heading>
          <Button colorScheme="gray" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>

        {/* Content area */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }}>
          {isLoading ? (
            <Flex align="center" justify="center" minH="200px">
              <Spinner size="lg" thickness="3px" color="blue.500" />
            </Flex>
          ) : error ? (
            <Text color="red.500" fontWeight="medium" textAlign="center">
              {error}
            </Text>
          ) : disagreements.length === 0 ? (
            <VStack spacing={2} py={8}>
              <Heading size="md" color="gray.700">No disagreements yet</Heading>
              <Text color="gray.500">Create your first disagreement to get started.</Text>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              {disagreements.map((d) => (
                <Box
                  as={RouterLink}
                  to={`/disagreement/${d._id}`}
                  key={d._id}
                  borderWidth="1px"
                  borderRadius="lg"
                  p={4}
                  _hover={{ bg: 'gray.50', shadow: 'md', transform: 'translateY(-2px)' }}
                  transition="all 0.2s ease"
                  cursor="pointer"
                >
                  <Heading size="md" noOfLines={1}>{d.text || 'Untitled Disagreement'}</Heading>
                  <Text color="gray.600" mt={2} noOfLines={2}>
                    {d.resolution ? `Resolution: ${d.resolution}` : 'No resolution yet. Click to view details.'}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Bottom action */}
        <Button colorScheme="blue" size="lg" width="100%" onClick={onOpen}>
          Create New Disagreement
        </Button>
      <CreateDisagreementModal
          isOpen={isModalOpen}
          onClose={onClose}
          onCreate={({ created }) => {
            if (created) {
              setDisagreements((prev) => [created, ...prev]);
            }
          }}
        />
      </VStack>
    </Box>
  );
}

export default DashboardPage;
