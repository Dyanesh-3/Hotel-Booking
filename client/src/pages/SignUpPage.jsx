import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
    return (
        <div className="flex items-center justify-center min-h-[70vh] py-10">
            <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
        </div>
    );
};

export default SignUpPage;
