import { useState } from 'react';
import { Box, Button, Input, VStack, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import authService from '../features/auth/authService.js';

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await authService.login(formData);
            if (user) {
                console.log('Login successful:', user);
                // Fallback notification to avoid importing unavailable Chakra exports
                if (typeof window !== 'undefined') {
                    window.alert('Login Successful: Welcome back!');
                }
                navigate('/dashboard');
            }
        } catch (error) {
            const message =
                (error && error.response && error.response.data && error.response.data.message) ||
                (error && error.message) ||
                error?.toString();
            if (typeof window !== 'undefined') {
                window.alert(`Login Failed: ${message}`);
            }
        }
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center" minH="100vh">
            <VStack as="form" onSubmit={onSubmit} spacing={4} w="100%" maxW="md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
                <Heading as="h1" size="lg">Log In</Heading>

                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="medium">Email address</Text>
                    <Input type="email" name="email" value={email} onChange={onChange} placeholder="Enter your email" required />
                </VStack>

                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="medium">Password</Text>
                    <Input type="password" name="password" value={password} onChange={onChange} placeholder="Enter your password" required />
                </VStack>

                <Button type="submit" colorScheme="blue" width="full">
                    Log In
                </Button>
            </VStack>
        </Box>
    );
}

export default LoginPage;