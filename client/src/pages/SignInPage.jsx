import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
    return (
        <div className="flex items-center justify-center min-h-[70vh] py-10">
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" withSignUp={false} />
        </div>
    );
};

export default SignInPage;
