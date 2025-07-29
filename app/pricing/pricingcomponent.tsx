/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client'
import React, { useState, useEffect, ChangeEvent } from 'react'
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Prediction } from '@prisma/client';
import moment from 'moment';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { MoreVertical, Check, X, Clock, Edit, Trash, LoaderCircle, PlusCircle } from 'lucide-react';
import { useDialog } from '../components/shared/dialog';
import { savePayment, updateTitle } from '../actions/utils';
import { Action, Column, TableComponent } from '../components/shared/TableSeater';
import Link from 'next/link';

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

const defaulttitles = [
    "Vip Predictions",
    "Bet of the day",
    "Previously Won Matches",
    "Free Hot Odds",
    "Midnight Owl",
]
const customgames = ['Bet of the Day', 'Correct Score', 'Draw Games']

const PricingComponent = ({ paymentKeys, content }: PricingComponentProps) => {
    const router = useRouter()
    const { user } = useAuth()
    //const { content, content.isSubscriptionActive } = useContent()
    const [pricingPlans, setPricingPlans] = useState<PricingPlanProps[]>([])

    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currency, setCurrency] = useState(1);


    const dialog = useDialog()
    const [games, setGames] = useState('soccer')
    const [updating, setUpdating] = useState<boolean>(false);
    const [currentposition, setCurrentPosition] = useState<number>(-1);
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState<Record<string, any>[]>([])

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

        }
    }, [content, content?.predictions]);

    useEffect(() => {
        if (content?.pricing) {
            content.pricing.length > 0 ? setPricingPlans(content.pricing) : null
            setLoading(false);
        }
    }, [pricingPlans, content?.pricing]);

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
            tx_ref: `cwa-${Date.now()}`,
            amount: plan.price * currency,
            currency: content.currencyrate ? user.location?.currencycode : "USD",
            payment_options: 'card,banktransfer,ussd,mobilemoneyghana,gpay,apay,paypal,opay',

            customer: {
                email: user.email,
                name: user.username,
            },

            customizations: {
                title: 'ChrisWrldArena Subscription',
                description: `Subscribe to ${plan.name}`,
                logo: 'https://chriswrldarena.com/img.png',
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
                if (response.status === 'successful') {
                    console.log(response)

                    const paymentdata = {
                        userId: user.id,
                        amount: parseFloat((plan.price * currency).toString()),
                        currency: plan.currency,
                        provider: 'Flutterwave',
                        status: "SUCCESS",
                        reference: response.transaction_id.toString() + " " + response.tx_ref,
                    }

                    const subscriptiondata = {
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
                        flutterwavePaymentId: response.transaction_id.toString(),
                    }
                    await savePayment(paymentdata, subscriptiondata)

                    toast('Payment successful! Subscription activated.');
                    window.location.href = '/pricing';
                } else {
                    console.log('Payment not successful:', response);
                    toast.error('Payment not completed.');
                }
            },
            onclose: async () => {
                toast.error('Payment window closed.');
            },
        });

    };

    const deletePrediction = async (index: number, id: string) => {
        setCurrentPosition(index);
        dialog.showDialog({
            title: "Delete Prediction",
            message: "Are you sure you want to delete this prediction? This action cannot be undone.",
            type: "confirm",
            onConfirm: async () => {
                setUpdating(true);
                try {
                    const response = await fetch(`/api/prediction/${id}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                    });
                    if (!response.ok) throw new Error("Failed to delete prediction");
                    setPredictions(predictions.filter(pred => pred.id !== id));
                    setUpdating(false);
                } catch (error) {
                    setUpdating(false);
                    console.error("Error deleting prediction:", error);
                }

            }
        })
    }

    const updateWLPrediction = async (index: number, prediction: Prediction, data: string) => {
        setCurrentPosition(index);
        const { id, ...dataWithoutId } = prediction;
        dialog.showDialog({
            title: "Update Prediction",
            message: `Are you sure you want to update this prediction to "${data}"?`,
            type: "confirm",
            onConfirm: async () => {
                setUpdating(true);
                try {
                    const response = await fetch(`/api/prediction/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            //...dataWithoutId,
                            result: data,
                        }),
                    });
                    if (!response.ok) throw new Error("Failed to Update prediction");
                    const newresult = await response.json();

                    const newdata = predictions.filter((pred) => pred.id !== id)
                    setPredictions([
                        ...newdata,
                        newresult
                    ])


                    setUpdating(false);
                    // setPredictions(result);
                } catch (error) {
                    setUpdating(false);
                }

            }
        })
    }


    const VIPGames = predictions.filter(prediction => prediction.result === "PENDING" && !prediction.isFree && !prediction.isCustom)
    const CorrectScoreGames = predictions.filter(prediction => prediction.result === "PENDING" && !prediction.isFree && prediction.customTitle === "Correct Score")
    const DrawGames = predictions.filter(prediction => prediction.result === "PENDING" && !prediction.isFree && prediction.customTitle === "Draw Games")
    const BetOfTheDayGames = predictions.filter(prediction => prediction.result === "PENDING" && prediction.isCustom && prediction.isFree)
    const PrevWonGames = predictions.filter(prediction => prediction.result !== "PENDING" && !prediction.isFree)

    const VIPGamesData = () => {
        const columns: Column<Prediction>[] = [
            {
                header: 'Date',
                accessorKey: 'publishedAt',
                cell: (prediction) => (
                    <>
                        {moment(prediction.publishedAt).format('LL')}
                        <br />
                        {moment(prediction.publishedAt).format('LT')}
                    </>
                ),
            },
            {
                header: 'Match',
                accessorKey: 'homeTeam',
                cell: (prediction) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {prediction.league || 'Unknown League'}
                        </div>
                        <div className="text-sm text-gray-600 ">
                            {prediction.homeTeam} vs {prediction.awayTeam}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Prediction',
                accessorKey: 'tip',
                cell: (prediction) => prediction.tip || 'No prediction available',
            },
            {
                header: 'Odds',
                accessorKey: 'odds',
                cell: (prediction) => (
                    <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                        {prediction.odds || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Result',
                accessorKey: 'result',
                cell: (prediction, rowIndex, colIndex) => {
                    if (prediction.result === "WON") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title='Won'>
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Check className="w-4 h-4" />}
                        </span>;
                    }
                    if (prediction.result === "LOST") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Lost">
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <X className="w-4 h-4" />}
                        </span>;
                    }
                    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Pending">
                        {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Clock className="w-4 h-4"/>}
                    </span>;
                },
            },
        ];
        const actions: Action<Prediction>[] = user?.role === "ADMIN" ? [
            {
                label: 'Won',
                icon: <Check className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'WON'),
            },
            {
                label: 'Lost',
                icon: <X className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'LOST'),
            },
            {
                label: 'Pending',
                icon: <Clock className="w-4 h-4 text-gray-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'PENDING'),
            },
            {
                label: 'Edit',
                icon: <Edit className="w-4 h-4 text-gray-500" />,
                onClick: (prediction) => {
                    window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                },
            },
            {
                label: 'Delete',
                icon: <Trash className="w-4 h-4 text-red-500" />,
                onClick: (prediction, index) => deletePrediction(index, prediction.id),
                className: 'text-red-600',
            },
        ] : [];
        const slice = 10
        const header = {
            title: "VIP Odds Predictions"
        }

        const uniqueId = Date.now().toString()
        const footer = {
            emptyMessage: 'Empty List',
            viewMoreLink: "/pricing",
            viewMoreText: content.isSubscriptionActive ? "View More VIP Matches" : !user ? "Sign in to View" : "Upgrade to VIP",
            customActions: user?.role === "ADMIN" && (
                <Link
                    href={user ? "/dashboard/predictions/create" : "/signin"}
                    className="text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                >
                    <div className="group flex gap-1 items-center underline underline-offset-4 text-green-500 hover:text-gray-900">
                        <PlusCircle className='text-green-500 size-5 group-hover:text-gray-900' /> Add Data
                    </div>
                    {!user && "Sign in to View"}
                </Link>
            )
        }

        return {
            data: VIPGames,
            columns,
            actions,
            header,
            footer,
            slice,

            updating,
            uniqueId
        }
    }
    const CorrectScoreGamesData = () => {
        const columns: Column<Prediction>[] = [
            {
                header: 'Date',
                accessorKey: 'publishedAt',
                cell: (prediction) => (
                    <>
                        {moment(prediction.publishedAt).format('LL')}
                        <br />
                        {moment(prediction.publishedAt).format('LT')}
                    </>
                ),
            },
            {
                header: 'Match',
                accessorKey: 'homeTeam',
                cell: (prediction) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {prediction.league || 'Unknown League'}
                        </div>
                        <div className="text-sm text-gray-600 ">
                            {prediction.homeTeam} vs {prediction.awayTeam}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Prediction',
                accessorKey: 'tip',
                cell: (prediction) => prediction.tip || 'No prediction available',
            },
            {
                header: 'Odds',
                accessorKey: 'odds',
                cell: (prediction) => (
                    <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                        {prediction.odds || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Result',
                accessorKey: 'result',
                cell: (prediction, rowIndex, colIndex) => {
                    if (prediction.result === "WON") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title='Won'>
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Check className="w-4 h-4" />}
                        </span>;
                    }
                    if (prediction.result === "LOST") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Lost">
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <X className="w-4 h-4" />}
                        </span>;
                    }
                    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Pending">
                        {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Clock className="w-4 h-4"/>}
                    </span>;
                },
            },
        ];
        const actions: Action<Prediction>[] = user?.role === "ADMIN" ? [
            {
                label: 'Won',
                icon: <Check className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'WON'),
            },
            {
                label: 'Lost',
                icon: <X className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'LOST'),
            },
            {
                label: 'Pending',
                icon: <Clock className="w-4 h-4 text-gray-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'PENDING'),
            },
            {
                label: 'Edit',
                icon: <Edit className="w-4 h-4 text-gray-500" />,
                onClick: (prediction) => {
                    window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                },
            },
            {
                label: 'Delete',
                icon: <Trash className="w-4 h-4 text-red-500" />,
                onClick: (prediction, index) => deletePrediction(index, prediction.id),
                className: 'text-red-600',
            },
        ] : [];
        const slice = 10
        const header = {
            title: "Correct Score Predictions"

        }

        const uniqueId = Date.now().toString()
        const footer = {
            emptyMessage: 'Empty List',
            viewMoreLink: "/predictions/custom",
            viewMoreText: "View More",
            customActions: user?.role === "ADMIN" && (
                <Link
                    href={user ? "/dashboard/predictions/create" : "/signin"}
                    className="text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                >
                    <div className="group flex gap-1 items-center underline underline-offset-4 text-green-500 hover:text-gray-900">
                        <PlusCircle className='text-green-500 size-5 group-hover:text-gray-900' /> Add Data
                    </div>
                    {!user && "Sign in to View"}
                </Link>
            )
        }

        return {
            data: CorrectScoreGames,
            columns,
            actions,
            header,
            footer,
            slice,

            updating,
            uniqueId
        }
    }
    const DrawGamesData = () => {
        const columns: Column<Prediction>[] = [
            {
                header: 'Date',
                accessorKey: 'publishedAt',
                cell: (prediction) => (
                    <>
                        {moment(prediction.publishedAt).format('LL')}
                        <br />
                        {moment(prediction.publishedAt).format('LT')}
                    </>
                ),
            },
            {
                header: 'Match',
                accessorKey: 'homeTeam',
                cell: (prediction) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {prediction.league || 'Unknown League'}
                        </div>
                        <div className="text-sm text-gray-600 ">
                            {prediction.homeTeam} vs {prediction.awayTeam}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Prediction',
                accessorKey: 'tip',
                cell: (prediction) => prediction.tip || 'No prediction available',
            },
            {
                header: 'Odds',
                accessorKey: 'odds',
                cell: (prediction) => (
                    <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                        {prediction.odds || 'N/A'}
                    </span>
                ),
            }, {
                header: 'Analysis',
                accessorKey: 'analysis',
                cell: (prediction) => (
                    <span className="px-2 py-1 text-xs text-neutral-800 rounded-full" title={prediction.analysis || ""}>
                        <Popover>
                            <PopoverTrigger className='max-w-lg w-full' asChild>
                                <p className="max-w-xs truncate text-sm cursor-default">{prediction.analysis}</p>

                            </PopoverTrigger>
                            <PopoverContent align="center" className=" h-auto w-md bg-white z-50 rounded-lg shadow-lg border-2 border-neutral-300 p-4 outline-0">
                                <p className="whitespace-pre-wrap text-sm">{prediction.analysis}</p>
                            </PopoverContent>
                        </Popover>

                    </span>
                ),
            },
            {
                header: 'Result',
                accessorKey: 'result',
                cell: (prediction, rowIndex, colIndex) => {
                    if (prediction.result === "WON") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title='Won'>
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Check className="w-4 h-4" />}
                        </span>;
                    }
                    if (prediction.result === "LOST") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Lost">
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <X className="w-4 h-4" />}
                        </span>;
                    }
                    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Pending">
                        {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Clock className="w-4 h-4"/>}
                    </span>;
                },
            },
        ];
        const actions: Action<Prediction>[] = user?.role === "ADMIN" ? [
            {
                label: 'Won',
                icon: <Check className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'WON'),
            },
            {
                label: 'Lost',
                icon: <X className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'LOST'),
            },
            {
                label: 'Pending',
                icon: <Clock className="w-4 h-4 text-gray-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'PENDING'),
            },
            {
                label: 'Edit',
                icon: <Edit className="w-4 h-4 text-gray-500" />,
                onClick: (prediction) => {
                    window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                },
            },
            {
                label: 'Delete',
                icon: <Trash className="w-4 h-4 text-red-500" />,
                onClick: (prediction, index) => deletePrediction(index, prediction.id),
                className: 'text-red-600',
            },
        ] : [];
        const slice = 10
        const header = {
            title: "Draw Games Predictions",

        }

        const uniqueId = Date.now().toString()
        const footer = {
            emptyMessage: 'Empty List',
            viewMoreLink: "/predictions/previousgames",
            viewMoreText: "View More",
            customActions: user?.role === "ADMIN" && (
                <Link
                    href={user ? "/dashboard/predictions/create" : "/signin"}
                    className="text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                >
                    <div className="group flex gap-1 items-center underline underline-offset-4 text-green-500 hover:text-gray-900">
                        <PlusCircle className='text-green-500 size-5 group-hover:text-gray-900' /> Add Data
                    </div>
                    {!user && "Sign in to View"}
                </Link>
            )
        }

        return {
            data: DrawGames,
            columns,
            actions,
            header,
            footer,
            slice,

            updating,
            uniqueId
        }
    }
    const BetOfTheDayGamesData = () => {
        const columns: Column<Prediction>[] = [
            {
                header: 'Date',
                accessorKey: 'publishedAt',
                cell: (prediction) => (
                    <>
                        {moment(prediction.publishedAt).format('LL')}
                        <br />
                        {moment(prediction.publishedAt).format('LT')}
                    </>
                ),
            },
            {
                header: 'Match',
                accessorKey: 'homeTeam',
                cell: (prediction) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {prediction.league || 'Unknown League'}
                        </div>
                        <div className="text-sm text-gray-600 ">
                            {prediction.homeTeam} vs {prediction.awayTeam}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Prediction',
                accessorKey: 'tip',
                cell: (prediction) => prediction.tip || 'No prediction available',
            },
            {
                header: 'Odds',
                accessorKey: 'odds',
                cell: (prediction) => (
                    <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                        {prediction.odds || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Result',
                accessorKey: 'result',
                cell: (prediction, rowIndex, colIndex) => {
                    if (prediction.result === "WON") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title='Won'>
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Check className="w-4 h-4" />}
                        </span>;
                    }
                    if (prediction.result === "LOST") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Lost">
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <X className="w-4 h-4" />}
                        </span>;
                    }
                    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Pending">
                        {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Clock className="w-4 h-4"/>}
                    </span>;
                },
            },
        ];
        const actions: Action<Prediction>[] = user?.role === "ADMIN" ? [
            {
                label: 'Won',
                icon: <Check className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'WON'),
            },
            {
                label: 'Lost',
                icon: <X className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'LOST'),
            },
            {
                label: 'Pending',
                icon: <Clock className="w-4 h-4 text-gray-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'PENDING'),
            },
            {
                label: 'Edit',
                icon: <Edit className="w-4 h-4 text-gray-500" />,
                onClick: (prediction) => {
                    window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                },
            },
            {
                label: 'Delete',
                icon: <Trash className="w-4 h-4 text-red-500" />,
                onClick: (prediction, index) => deletePrediction(index, prediction.id),
                className: 'text-red-600',
            },
        ] : [];
        const slice = 10
        const header = {
            title: "Bet of the Day Predictions"

        }

        const uniqueId = Date.now().toString()
        const footer = {
            emptyMessage: 'Empty List',
            viewMoreLink: "/predictions/freegames",
            viewMoreText: "View More",
            customActions: user?.role === "ADMIN" && (
                <Link
                    href={user ? "/dashboard/predictions/create" : "/signin"}
                    className="text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                >
                    <div className="group flex gap-1 items-center underline underline-offset-4 text-green-500 hover:text-gray-900">
                        <PlusCircle className='text-green-500 size-5 group-hover:text-gray-900' /> Add Data
                    </div>
                    {!user && "Sign in to View"}
                </Link>
            ),
        }
        const className = "bg-green-50 border-2 border-green-200 rounded-lg"

        return {
            data: BetOfTheDayGames,
            columns,
            actions,
            header,
            footer,
            slice,

            updating,
            uniqueId,
            className
        }
    }
    const PrevGamesData = () => {
        const columns: Column<Prediction>[] = [
            {
                header: 'Date',
                accessorKey: 'publishedAt',
                cell: (prediction) => (
                    <>
                        {moment(prediction.publishedAt).format('LL')}
                        <br />
                        {moment(prediction.publishedAt).format('LT')}
                    </>
                ),
            },
            {
                header: 'Match',
                accessorKey: 'homeTeam',
                cell: (prediction) => (
                    <div>
                        <div className="text-sm font-medium text-gray-900">
                            {prediction.league || 'Unknown League'}
                        </div>
                        <div className="text-sm text-gray-600 ">
                            {prediction.homeTeam} vs {prediction.awayTeam}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Prediction',
                accessorKey: 'tip',
                cell: (prediction) => prediction.tip || 'No prediction available',
            },
            {
                header: 'Odds',
                accessorKey: 'odds',
                cell: (prediction) => (
                    <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                        {prediction.odds || 'N/A'}
                    </span>
                ),
            },
            {
                header: 'Result',
                accessorKey: 'result',
                cell: (prediction, rowIndex, colIndex) => {
                    if (prediction.result === "WON") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" title='Won'>
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Check className="w-4 h-4" />}
                        </span>;
                    }
                    if (prediction.result === "LOST") {
                        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title="Lost">
                            {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <X className="w-4 h-4" />}
                        </span>;
                    }
                    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800" title="Pending">
                        {updating && rowIndex === currentposition ? <LoaderCircle className="animate-spin size-4" /> : <Clock className="w-4 h-4"/>}
                    </span>;
                },
            },
        ];
        const actions: Action<Prediction>[] = user?.role === "ADMIN" ? [
            {
                label: 'Won',
                icon: <Check className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'WON'),
            },
            {
                label: 'Lost',
                icon: <X className="w-4 h-4 text-neutral-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'LOST'),
            },
            {
                label: 'Pending',
                icon: <Clock className="w-4 h-4 text-gray-500" />,
                onClick: (prediction, index) => updateWLPrediction(index, prediction, 'PENDING'),
            },
            {
                label: 'Edit',
                icon: <Edit className="w-4 h-4 text-gray-500" />,
                onClick: (prediction) => {
                    window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                },
            },
            {
                label: 'Delete',
                icon: <Trash className="w-4 h-4 text-red-500" />,
                onClick: (prediction, index) => deletePrediction(index, prediction.id),
                className: 'text-red-600',
            },
        ] : [];
        const slice = 10
        const header = {
            title: "Previous Games Predictions"
        }
        const uniqueId = Date.now().toString()
        const footer = {
            emptyMessage: 'Empty List',
            viewMoreLink: "/predictions/freegames",
            viewMoreText: "View More",
            customActions: user?.role === "ADMIN" && (
                <Link
                    href={user ? "/dashboard/predictions/create" : "/signin"}
                    className="text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                >
                    <div className="group flex gap-1 items-center underline underline-offset-4 text-green-500 hover:text-gray-900">
                        <PlusCircle className='text-green-500 size-5 group-hover:text-gray-900' /> Add Data
                    </div>
                    {!user && "Sign in to View"}
                </Link>
            ),
        }
        const className = "bg-purple-50 border-2 border-purple-200 rounded-lg"

        return {
            data: PrevWonGames,
            columns,
            actions,
            header,
            footer,
            slice,

            updating,
            uniqueId,
            className
        }
    }

    return (
        <div className="relative mx-auto px-4 py-12 w-full">
            <div className="absolute inset-0 bg-cover bg-center h-64 shadow-lg -z-20"
                style={{
                    backgroundImage: 'linear-gradient(to right, #1a1818c0, #111010cb), url(/stadium.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
            </div>
            <div className="absolute inset-0 -z-30">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20, 184, 28, 0.986),transparent_50%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent,rgba(24, 104, 24, 0.932)_20%,rgba(26, 184, 20, 0)_80%)]" />
                <div className="absolute w-full h-full bg-[radial-gradient(#14b8a650_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>
            <div className="max-w-4xl mx-auto mt-28 z-50">
                {!content.isSubscriptionActive && <h1 className="text-4xl font-bold mb-20 text-white">Choose Your Plan</h1>}
                {content.isSubscriptionActive && <h1 className="text-4xl font-bold mb-20 text-white">Vip Predictions & Analysis</h1>}
                {!content.isSubscriptionActive && <p className="text-2xl text-gray-600 text-center mt-32">Get access to premium predictions and expert analysis</p>}
            </div>
            <div className="flex flex-col max-w-[95rem] w-full mx-auto gap-16">
                {!content.isSubscriptionActive && <div className="w-full grid justify-center gap-8 max-w-7xl mx-auto my-16">
                    <div className="md:col-start-2 md:col-span-2 flex flex-col md:flex-row gap-8 justify-center items-center mx-auto w-full">
                        {pricingPlans.length > 0 && user && pricingPlans.map((plan, index) => (
                            <div
                                key={plan.id}
                                className={`relative bg-neutral-100 w-full rounded-lg p-8 transform hover:scale-105 hover:shadow-2xl transition-transform duration-300 ${plan.isPopular ? 'border-2 border-green-900' : 'border border-neutral-200 shadow-md'} col-start-${2}`}
                            >
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 bg-green-900 text-white px-4 py-1 rounded-bl-lg">
                                        Popular
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">{plan.name}</h2>
                                <p className="text-4xl font-bold text-green-900 mb-6">
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
                                    className="w-full bg-green-900 text-white py-3 rounded-md hover:bg-green-700 transition-colors"
                                    onClick={() => handleFlutterwavePayment(plan)}
                                >
                                    Pay with Flutterwave
                                </button>
                            </div>
                        ))}
                        <div className="col-span-2 flex justify-center items-center">
                            {!loading && !user && (
                                <Link href="/signin" className="bg-green-900 text-white px-8 py-3 rounded-md hover:bg-green-950 transition-colors">
                                    Sign in to Subscribe
                                </Link>
                            )}
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <LoaderCircle className="animate-spin h-5 w-5 text-green-900" />
                                    <span className="text-gray-600">Loading plans...</span>
                                </div>
                            ) : pricingPlans.length === 0 && (
                                <p className="text-gray-600">No pricing plans available</p>
                            )}
                        </div>
                    </div>
                </div>}

                {content.isSubscriptionActive && <div className="flex flex-col max-w-[95rem] w-full mx-auto gap-16 mt-16">

                    <TableComponent
                        uniqueId={VIPGamesData().uniqueId}
                        data={VIPGamesData().data}
                        columns={VIPGamesData().columns}
                        actions={VIPGamesData().actions}
                        footer={VIPGamesData().footer}
                        header={VIPGamesData().header}
                        updating={updating}
                        currentPosition={currentposition}
                    />

                    <TableComponent
                        uniqueId={CorrectScoreGamesData().uniqueId}
                        data={CorrectScoreGamesData().data}
                        columns={CorrectScoreGamesData().columns}
                        actions={CorrectScoreGamesData().actions}
                        footer={CorrectScoreGamesData().footer}
                        header={CorrectScoreGamesData().header}
                        updating={updating}
                        currentPosition={currentposition}
                    />
                    <TableComponent
                        uniqueId={DrawGamesData().uniqueId}
                        data={DrawGamesData().data}
                        columns={DrawGamesData().columns}
                        actions={DrawGamesData().actions}
                        footer={DrawGamesData().footer}
                        header={DrawGamesData().header}
                        updating={updating}
                        currentPosition={currentposition}
                    />
                    <TableComponent
                        uniqueId={PrevGamesData().uniqueId}
                        data={PrevGamesData().data}
                        columns={PrevGamesData().columns}
                        actions={PrevGamesData().actions}
                        footer={PrevGamesData().footer}
                        header={PrevGamesData().header}
                        className={PrevGamesData().className}
                        updating={updating}
                        currentPosition={currentposition}
                    />

                </div>}

            </div >
        </div >
    )
}

export default PricingComponent