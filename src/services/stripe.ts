import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ENVIRONMENT_CONFIG } from '../config/environment';

interface BarqueaStripeProviderProps {
    children: React.ReactNode;
}

export const BarqueaStripeProvider: React.FC<BarqueaStripeProviderProps> = ({ children }) => {
    const publishableKey = ENVIRONMENT_CONFIG.STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
        console.error('⚠️ Stripe publishable key not found in environment config');
        // Return children without Stripe provider in case key is missing
        return <>{children}</>;
    }

    return (
        <StripeProvider
            publishableKey={publishableKey}
            merchantIdentifier="merchant.com.barquea.mobile" // This would need to be updated for iOS production
        >
            {children}
        </StripeProvider>
    );
};

export default BarqueaStripeProvider;