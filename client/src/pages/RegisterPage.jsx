import { useState } from 'react';
import { Box, Button, Input, VStack, Heading, Text } from '@chakra-ui/react';
import authService from '../features/auth/authService.js';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password2: '', // For confirmation
    });
    const navigate = useNavigate();

    const { name, email, password, password2 } = formData;

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (password !== password2) {
            if (typeof window !== 'undefined') {
                window.alert('Registration Failed: Passwords do not match.');
            }
            return;
        }

        try {
            const userData = { name, email, password };
            const user = await authService.register(userData);
            if (user) {
                console.log('Registration successful:', user);
                if (typeof window !== 'undefined') {
                    window.alert('Account Created: You have been successfully registered.');
                }
                navigate('/dashboard'); // Redirect to dashboard on success
            }
        } catch (error) {
            const message =
                (error && error.response && error.response.data && error.response.data.message) ||
                (error && error.message) ||
                error?.toString();
            if (typeof window !== 'undefined') {
                window.alert(`Registration Failed: ${message}`);
            }
        }
    };

    return (
        <Box display="flex" alignItems="center" justifyContent="center" minH="100vh">
            <VStack as="form" onSubmit={onSubmit} spacing={4} w="100%" maxW="md" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
                <Heading as="h1" size="lg">Create Account</Heading>

                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="medium">Name</Text>
                    <Input type="text" name="name" value={name} onChange={onChange} placeholder="Enter your name" required />
                </VStack>

                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="medium">Email address</Text>
                    <Input type="email" name="email" value={email} onChange={onChange} placeholder="Enter your email" required />
                </VStack>

                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="medium">Password</Text>
                    <Input type="password" name="password" value={password} onChange={onChange} placeholder="Enter your password" required />
                </VStack>

                <VStack align="stretch" spacing={1}>
                    <Text fontWeight="medium">Confirm Password</Text>
                    <Input type="password" name="password2" value={password2} onChange={onChange} placeholder="Confirm your password" required />
                </VStack>

                <Button type="submit" colorScheme="blue" width="full">
                    Sign Up
                </Button>
            </VStack>
        </Box>
    );
}

export default RegisterPage;