import { useState, useMemo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Text,
  Heading,
  Flex,
  Button,
} from '@chakra-ui/react';
import axios from 'axios';

/**
 * OnboardingModal
 * Spec: client/src/components/Onboarding/spec.md
 * - Chakra UI Modal + Tabs with 3 steps
 * - Primary CTA "Get Started" triggers backend API to mark onboarding complete
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onComplete?: function (optional) called after API call succeeds
 */
function OnboardingModal({ isOpen, onClose, onComplete }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Simple, stable emoji icons to avoid extra icon packages
  const steps = useMemo(
    () => [
      {
        key: 'state-your-case',
        emoji: '📝',
        title: '1. State Your Case',
        body:
          'Clearly explain your side of the story. Provide all the relevant facts and evidence to build your case.',
      },
      {
        key: 'ai-analyzes',
        emoji: '✨',
        title: '2. AI Analyzes',
        body:
          'Our impartial AI analyzes the conversation, identifies key points of agreement and disagreement, and may ask clarifying questions.',
      },
      {
        key: 'reach-agreement',
        emoji: '🤝',
        title: '3. Reach Agreement',
        body:
          'The AI drafts a neutral summary and a proposed resolution to help all parties find common ground and formally agree.',
      },
    ],
    []
  );

  const closeAndReset = () => {
    setTabIndex(0);
    onClose?.();
  };

  const handlePrev = () => setTabIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setTabIndex((i) => Math.min(steps.length - 1, i + 1));

  const handleGetStarted = async () => {
    // Per spec Section 5.0: close first, then call API
    closeAndReset();

    try {
      setSubmitting(true);
      // Pull token from localStorage
      const stored = localStorage.getItem('user');
      if (!stored) throw new Error('Not authenticated');
      const user = JSON.parse(stored);
      const token = user?.token;
      if (!token) throw new Error('Missing auth token');

      const url = 'http://localhost:3000/api/users/me/onboarding-complete';
      await axios.patch(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      // Persist locally so we do not show again
      try {
        const updated = { ...user, hasCompletedOnboarding: true };
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (_) {
        // ignore localStorage failures
      }

      onComplete?.({ success: true });
    } catch (err) {
      // Non-blocking error handling; the modal is already closed per spec order
      // Provide a minimal user-facing signal without Chakra toasts (version variance)
      // eslint-disable-next-line no-alert
      window?.alert?.(
        `Failed to update onboarding status. You can continue using the app.\n\n${
          err?.response?.data?.message || err?.message || 'Unknown error'
        }`
      );
      onComplete?.({ success: false, error: err });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={closeAndReset} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Welcome to Disagreement.AI</Heading>
        </ModalHeader>
        <ModalBody>
          <Tabs index={tabIndex} onChange={setTabIndex} isFitted variant="enclosed">
            <TabList>
              {steps.map((s) => (
                <Tab key={s.key} fontSize="sm">
                  {s.title.split('.')[0]}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {steps.map((s) => (
                <TabPanel key={s.key} px={0}>
                  <Flex direction="column" align="center" textAlign="center" gap={3} py={2}>
                    <Box fontSize="48px" aria-hidden>
                      {s.emoji}
                    </Box>
                    <Heading as="h3" size="md">
                      {s.title}
                    </Heading>
                    <Text color="gray.600">{s.body}</Text>
                  </Flex>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Flex w="100%" justify="space-between" align="center">
            <Button variant="ghost" onClick={closeAndReset} mr={3}>
              Close
            </Button>
            <Flex gap={2}>
              {tabIndex > 0 && (
                <Button onClick={handlePrev} variant="outline">
                  Back
                </Button>
              )}
              {tabIndex < steps.length - 1 ? (
                <Button colorScheme="blue" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button colorScheme="blue" onClick={handleGetStarted} isLoading={submitting}>
                  Get Started
                </Button>
              )}
            </Flex>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default OnboardingModal;
