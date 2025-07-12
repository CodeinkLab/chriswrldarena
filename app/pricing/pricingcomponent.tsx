/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client'
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Prediction } from '@prisma/client';
import moment from 'moment';

declare global {
    interface Window {
        FlutterwaveCheckout?: any;
    }
}

interface PricingPlanProps {
    id: string;
    name: string;
    price: number;
    currency: string;
    plan: string;
    features: string[];
    isPopular: boolean;
}


interface PricingComponentProps {
    paymentKeys: Record<string, string>;
    content: any
}

const PricingComponent = ({ paymentKeys, content }: PricingComponentProps) => {
    const router = useRouter()
    const { user } = useAuth()
    //const { content, content.isSubscriptionActive } = useContent()
    const [pricingPlans, setPricingPlans] = useState<PricingPlanProps[]>([])

    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currency, setCurrency] = useState(1);
    const predictionsPerPage = 20;
    const pageSize = predictions.length;
    const totalPages = Math.ceil(pageSize / predictionsPerPage);
    const startIndex = (currentPage - 1) * predictionsPerPage;
    const endIndex = startIndex + predictionsPerPage;
    const currentPredictions = predictions.slice(startIndex, endIndex);

    //console.log('Content:', content);

    useEffect(() => {
        window.addEventListener("error", (e) => {
            fetch("/api/log", {
                method: "POST",
                body: JSON.stringify({
                    message: e.message,
                    stack: e.error?.stack,
                    userAgent: navigator.userAgent,
                }),
            });
        });
    }, []);

    useEffect(() => {

        if (content?.predictions?.length > 0) {
            setCurrency(content.currencyrate.high_ask || 1)
            setPredictions(content?.predictions || []);
            console.log('Fetched predictions:', content?.predictions);
        }
    }, [content, content?.predictions]);

    useEffect(() => {
        if (content?.pricing) {
            content.pricing.length > 0 ? setPricingPlans(content.pricing) : null
        }
    }, [pricingPlans, content?.pricing]);

    console.log(content)
    // Load Flutterwave script
    useEffect(() => {
        if (!document.getElementById('flutterwave-script')) {
            const script = document.createElement('script');
            script.id = 'flutterwave-script';
            script.src = 'https://checkout.flutterwave.com/v3.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleFlutterwavePayment = (plan: PricingPlanProps) => {
        if (!user) return toast.error('Please log in to continue.');

        if (!window.FlutterwaveCheckout) {
            alert('Payment gateway not loaded. Please try again.');
            return;
        }
        window.FlutterwaveCheckout({
            public_key: paymentKeys.FLW_PUBLIC_KEY,
            tx_ref: `bbt-${Date.now()}`,
            amount: plan.price * currency,
            currency: content.currencyrate ? user.location?.currencycode : "USD",
            payment_options: 'card,banktransfer,ussd,mobilemoneyghana,mpesa,gpay,apay,paypal,opay',
            customer: {
                email: user.email,
                name: user.username,
            },
            customizations: {
                title: 'ChrisWrldArena Subscription',
                description: `Subscribe to ${plan.name}`,
                logo: 'https://chriswrldarena.vercel.app/img.png',
            },
            meta: {
                userId: user.id,
                plan: plan.plan,
                planName: plan.name,
                price: plan.price,
                currency: user.location?.currencycode || "USD",
                datetime: moment().format("LLL")
            },

            subaccounts: [{
                id: paymentKeys.FLW_SUBACCOUNT_ID
            }],
            callback: async (response: any) => {
                console.log('Payment response:', response);
                if (response.status === 'successful') {
                    await fetch('/api/payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            amount: parseFloat((plan.price * currency).toString()),
                            currency: plan.currency,
                            provider: 'Flutterwave',
                            status: "SUCCESS",
                            reference: response.id + "|" + response.tx_ref,
                        })
                    });
                    await fetch('/api/subscription', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user.id,
                            plan: plan.plan,
                            status: 'ACTIVE',
                            startedAt: new Date().toISOString(),
                            expiresAt: (() => {
                                const start = new Date();
                                if (plan.plan === 'DAILY') {
                                    start.setDate(start.getDate() + 1);
                                    start.setHours(1, 0, 0, 0);
                                } else if (plan.plan === 'WEEKLY') {
                                    start.setDate(start.getDate() + 7);
                                    start.setHours(1, 0, 0, 0)
                                }
                                return start.toISOString();
                            })(),
                            flutterwavePaymentId: response.id,
                        })
                    });

                    toast('Payment successful! Subscription activated.');
                    router.push('/profile'); // Redirect to subscription page
                } else {
                    toast.error('Payment not completed.');
                }
            },
            onclose: async () => {
                toast.error('On payment closed.');

            },
        });
    };

    return (
        <div className="relative mx-auto px-4 py-12">
            <div className="absolute inset-0 bg-cover bg-center h-64 shadow-lg -z-20"
                style={{
                    backgroundImage: 'linear-gradient(to right, #1a1818c0, #111010cb), url(/stadium.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>

            </div>
            <div className="max-w-4xl mx-auto mt-28 z-50">
                {!content.isSubscriptionActive && <h1 className="text-4xl font-bold mb-20 text-white">Choose Your Plan</h1>}
                {content.isSubscriptionActive && <h1 className="text-4xl font-bold mb-20 text-white">Vip Predictions & Analysis</h1>}
                {!content.isSubscriptionActive && <p className="text-2xl text-gray-600 text-center mt-32">Get access to premium predictions and expert analysis</p>}
            </div>
            {!content.isSubscriptionActive && <div className="container w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-center gap-8 max-w-7xl mx-auto my-16">
                <div className="md:col-start-2 md:col-span-2 flex flex-col md:flex-row gap-8 justify-center items-center mx-auto w-full">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={plan.id}
                            className={`relative bg-neutral-100 w-full rounded-lg p-8 transform hover:scale-105 hover:shadow-2xl transition-transform duration-300 ${plan.isPopular ? 'border-2 border-teal-600' : 'border border-neutral-200 shadow-md'} col-start-${2}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0 bg-teal-600 text-white px-4 py-1 rounded-bl-lg">
                                    Popular
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{plan.name}</h2>
                            <p className="text-4xl font-bold text-teal-600 mb-6">
                                <span className="text-base text-neutral-500">{user?.location?.currencycode || "USD"}</span>{(plan.price * currency).toLocaleString("en-US", { maximumFractionDigits: 0 })}<span className="text-lg font-normal text-gray-500">/{plan.plan}</span>
                            </p>
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className="w-full bg-teal-600 text-white py-3 rounded-md hover:bg-teal-700 transition-colors"
                                onClick={() => handleFlutterwavePayment(plan)}
                            >
                                Pay with Flutterwave
                            </button>
                        </div>
                    ))}
                </div>
            </div>}

            {content.isSubscriptionActive && <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-max">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        VIP Odds Predictions
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 13l3.293-6.586a1 1 0 011.707-.117L10 10.382l2.999-4.085a1 1 0 011.707.117L18 13H2zm0 2a1 1 0 001 1h14a1 1 0 001-1v-1H2v1z" />
                        </svg>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {currentPredictions
                                .filter(prediction => prediction.result === "PENDING" && !prediction.isFree)
                                .map((prediction, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-neutral-100">
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {moment(prediction.publishedAt).format('LL')}
                                            <br />
                                            {moment(prediction.publishedAt).format('LT')}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {prediction.sportType} &bull; {prediction.league || 'Unknown League'}
                                            </div>
                                            <div className="text-sm text-gray-600 w-44 truncate">
                                                {prediction.homeTeam} vs {prediction.awayTeam}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 w-20 truncate">
                                            {prediction.tip || 'No prediction available'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                                                {prediction.odds || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap line-clamp-1 max">{prediction.analysis}</td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Won ✓
                                            </span>}
                                            {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Lost ✗
                                            </span>}
                                            {prediction.result === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pending ⏳
                                            </span>}

                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {Math.min((currentPage - 1) * pageSize + 1, totalPages)}-
                            {Math.min(currentPage * pageSize, totalPages)} of {totalPages} results
                        </p>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>}
            <br />
            {content.isSubscriptionActive && <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-yellow-200 h-max">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Previous Predictions
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analysis</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white ">
                            {currentPredictions
                                .filter(prediction => prediction.result !== "PENDING" && !prediction.isFree)
                                .map((prediction, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-neutral-100 ">
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600">
                                            {moment(prediction.publishedAt).format('LL')}
                                            <br />
                                            {moment(prediction.publishedAt).format('LT')}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {prediction.sportType} &bull; {prediction.league || 'Unknown League'}
                                            </div>
                                            <div className="text-sm text-gray-600 w-44 truncate">
                                                {prediction.homeTeam} vs {prediction.awayTeam}
                                            </div>
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-600 w-20 truncate">
                                            {prediction.tip || 'No prediction available'}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                                                {(1.5 + (index % 5) * 0.25).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 max-w-xs truncate relative group z-50 cursor-default">
                                            <span>
                                                {prediction.analysis?.slice(0, 30) || ''}
                                                {prediction.analysis && prediction.analysis.length > 30 ? '...' : ''}
                                            </span>
                                            {prediction.analysis && prediction.analysis.length > 30 && (
                                                <div className="absolute inset-0 mx-auto z-[555] left-1/3 hidden group-hover:block bg-white border border-gray-300 rounded shadow-lg p-2 w-64 h-auto text-xs text-gray-800">
                                                    <p className='whitespace-pre-wrap'>{prediction.analysis}</p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-2 whitespace-nowrap">
                                            {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Won ✓
                                            </span>}
                                            {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Lost ✗
                                            </span>}

                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {Math.min((currentPage - 1) * pageSize + 1, totalPages)}-
                            {Math.min(currentPage * pageSize, totalPages)} of {totalPages} results
                        </p>
                        <div className="flex gap-2">
                            <button
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default PricingComponent