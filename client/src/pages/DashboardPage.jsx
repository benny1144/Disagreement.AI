import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, Flex, Button, Spinner, Grid, GridItem } from '@chakra-ui/react';
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

  const Card = ({ children, ...rest }) => (
    <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }} {...rest}>
      {children}
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.50" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      <VStack maxW="6xl" mx="auto" spacing={8} align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Heading size="xl" letterSpacing="tight">Your Dashboard</Heading>
          <Button colorScheme="gray" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </Flex>

        {/* Bento Grid */}
        {isLoading ? (
          <Card>
            <Flex align="center" justify="center" minH="200px">
              <Spinner size="lg" thickness="3px" color="blue.500" />
            </Flex>
          </Card>
        ) : error ? (
          <Card>
            <Text color="red.500" fontWeight="medium" textAlign="center">
              {error}
            </Text>
          </Card>
        ) : (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={{ base: 4, md: 6 }}>
            {/* Box 1: My Active Disagreements (spans 2 cols on desktop) */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Card>
                <Heading as="h2" size="md" mb={4}>Active Disagreements</Heading>
                {disagreements.length === 0 ? (
                  <Flex direction="column" align="center" justify="center" py={10} color="gray.600">
                    <Text fontSize="4xl" aria-hidden>📭</Text>
                    <Text mt={3} textAlign="center">You have no active disagreements. Create one to get started!</Text>
                  </Flex>
                ) : (
                  <Box maxH={{ base: 'unset', md: '320px' }} overflowY="auto" pr={1}>
                    <VStack spacing={3} align="stretch">
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
                          <Heading size="sm" noOfLines={1}>{d.text || 'Untitled Disagreement'}</Heading>
                          <Text color="gray.600" mt={1} noOfLines={1}>
                            Participants: You
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Card>
            </GridItem>

            {/* Box 2: Create New Disagreement (CTA card) */}
            <GridItem>
              <Card
                role="button"
                onClick={onOpen}
                _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}
                transition="all 0.2s ease"
              >
                <VStack align="start" spacing={2}>
                  <Box
                    w={10}
                    h={10}
                    borderRadius="full"
                    bg="#5D5FEF"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                    aria-hidden
                  >
                    +
                  </Box>
                  <Heading as="h3" size="md">New Disagreement</Heading>
                  <Text color="gray.600">Start a new resolution process.</Text>
                </VStack>
              </Card>
            </GridItem>

            {/* Box 3: Resolution Analytics (My Stats) */}
            <GridItem>
              <Card>
                <Heading as="h3" size="md" mb={4}>My Stats</Heading>
                <Flex gap={8} wrap="wrap">
                  <VStack align="start" spacing={0} minW="140px">
                    <Text fontSize="sm" color="gray.600">Cases Resolved</Text>
                    <Text fontSize="3xl" fontWeight="bold">0</Text>
                  </VStack>
                  <VStack align="start" spacing={0} minW="140px">
                    <Text fontSize="sm" color="gray.600">Success Rate</Text>
                    <Text fontSize="3xl" fontWeight="bold">N/A</Text>
                  </VStack>
                </Flex>
              </Card>
            </GridItem>

            {/* Box 4: Recent Activity (spans 2 cols on bottom row) */}
            <GridItem colSpan={{ base: 1, md: 2 }}>
              <Card>
                <Heading as="h3" size="md" mb={2}>Recent Activity</Heading>
                <Text color="gray.600">Activity feed coming soon.</Text>
              </Card>
            </GridItem>
          </Grid>
        )}

        {/* Modal for creating disagreements */}
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
