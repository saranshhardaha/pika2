import React from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Upload up to 10GB',
      'Share with 5 people',
      'Basic support'
    ],
    stripePriceId: null
  },
  {
    name: 'Pro',
    price: '$9.99/month',
    features: [
      'Upload up to 25GB',
      'Share with 25 people',
      'Priority support',
      'Advanced analytics'
    ],
    stripePriceId: 'price_pro'
  },
  {
    name: 'Enterprise',
    price: '$24.99/month',
    features: [
      'Upload up to 100GB',
      'Share with 80 people',
      '24/7 support',
      'Custom branding',
      'API access'
    ],
    stripePriceId: 'price_enterprise'
  }
];

export default function SubscriptionPlans() {
  const handleSubscribe = async (priceId: string | null) => {
    if (!priceId) return; // Free tier

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please login first');

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: session.user.id,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  return (
    <div className=" py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {plans.map((plan) => (
            <div key={plan.name} className="border border-gray-700 rounded-lg shadow-xl divide-y divide-gray-700 bg-neutral-800">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-300">
                  Perfect for growing businesses
                </p>
                <p className="mt-8">
                  <span className="text-xl text-center w-full lg:text-4xl font-extrabold text-white">{plan.price}</span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan.stripePriceId)}
                  className="mt-8 block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                >
                  {plan.stripePriceId ? 'Subscribe' : 'Get Started'}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-medium text-white tracking-wide">
                  What's included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-400" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}