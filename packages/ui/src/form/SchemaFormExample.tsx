import React from 'react';
import { SchemaForm } from './SchemaForm';
import { nu } from '@repo/core';

// Example usage of SchemaForm
export const SchemaFormExample: React.FC = () => {
  // Define a schema for a contact form
  const contactSchema = nu.object({
    name: nu.string()
      .meta({
        label: 'Full Name',
        description: 'Enter your full name',
      }),
    email: nu.string()
      .meta({
        label: 'Email Address',
        description: 'Enter your email address',
      }),
    age: nu.number()
      .meta({
        label: 'Age',
        description: 'Enter your age',
      }),
    subscribe: nu.boolean()
      .meta({
        label: 'Subscribe to Newsletter',
        description: 'Would you like to receive our newsletter?',
      }),
  });

  const handleSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    alert(`Form submitted! Check console for details.`);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Form</h2>
      <SchemaForm
        schema={contactSchema}
        onSubmit={handleSubmit}
        submitText="Submit Contact"
        className="space-y-4"
      />
    </div>
  );
};

export default SchemaFormExample;
