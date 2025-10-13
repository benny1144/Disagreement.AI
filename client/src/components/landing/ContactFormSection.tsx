// client/src/components/landing/ContactFormSection.tsx

"use client";

import React, { useState } from "react";

export function ContactFormSection() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        message: "",
    });
    // New state to provide feedback to the user
    const [formStatus, setFormStatus] = useState("");

    // The function is now 'async' to handle the fetch call
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("Submitting..."); // Let the user know something is happening

        try {
            // --- This block replaces the console.log ---
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            // --- End of replacement ---

            if (!response.ok) {
                // Handle server errors (e.g., 500) without throwing locally
                const msg = `Submission failed (status ${response.status}). Please try again.`;
                setFormStatus(msg);
                return; // Avoid throwing and catching locally
            }

            // Success!
            setFormStatus("Thank you! Your submission has been received. Email benny@disagreement.ai with any other questions or comments.");
            setFormData({ fullName: "", email: "", message: "" }); // Clear the form
        } catch (error) {
            // Handle network errors or if the fetch itself fails
            console.error("Submission error:", error);
            setFormStatus("Something went wrong. Please directly email benny@disagreement.ai");
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <section id="waitlist-form" className="w-full py-20 px-4 md:py-32 bg-white">
            <div className="container mx-auto max-w-2xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                        Ask a Question -or- Get Early Access to the Test Product
                    </h2>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Whether you have a question or want to be the first to know when our initial test product launches, we'd love to hear from you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... Your input fields for fullName, email, and message remain unchanged ... */}

                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter your email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full h-12 px-4 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-slate-700">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            placeholder="Let us know how you heard about us or if you have any questions..."
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="w-full min-h-[140px] p-4 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full h-12 bg-[#2667FF] text-base font-medium text-white rounded-md transition-colors hover:bg-blue-700"
                    >
                        Submit
                    </button>

                    {/* This new paragraph displays our status message to the user */}
                    {formStatus && <p className="text-sm text-center text-slate-600">{formStatus}</p>}

                </form>
            </div>
        </section>
    );
}