/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client'
import Link from 'next/link'
import Image from 'next/image'

import { Prediction } from '../lib/interface';
import { ChangeEvent, useEffect, useState } from 'react';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { sportTypeOptions } from '../lib/formschemas/predictionForm';
import { Check, Clock, Edit, Edit2, LoaderCircle, MoreVertical, PlusCircle, Trash, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDialog } from '../components/shared/dialog';
import { updateTitle } from '../actions/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';

const HomePageComponent = ({ content }: { content: any }) => {
    const { user } = useAuth()
    const dialog = useDialog()
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const predictionsPerPage = 20;
    const pageSize = predictions.length;
    const totalPages = Math.ceil(pageSize / predictionsPerPage);
    const startIndex = (currentPage - 1) * predictionsPerPage;
    const endIndex = startIndex + predictionsPerPage;
    const currentPredictions = predictions.slice(startIndex, endIndex);
    const [games, setGames] = useState('soccer')
    const [updating, setUpdating] = useState<boolean>(false);
    const [currentposition, setCurrentPosition] = useState<number>(-1);
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState<Record<string, any>[]>([])


    const defaulttitles = [
        "Vip Predictions",
        "Bet of the day",
        "Previously Won Matches",
        "Free Hot Odds",
        "Midnight Owl",
    ]

    const features = [
        {
            title: 'AI-Powered Analysis',
            description: 'Our advanced AI algorithms analyze millions of data points to provide highly accurate predictions.',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            gradient: 'from-orange-500 to-purple-500'
        },
        {
            title: 'Real-Time Updates',
            description: 'Get instant notifications and live updates for matches, odds changes, and prediction results.',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-green-500 to-teal-500'
        },
        {
            title: 'Secure Payments',
            description: 'Multiple payment options with bank-grade security. Easy subscriptions and instant access.',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            gradient: 'from-orange-500 to-orange-500'
        },
        {
            title: 'Premium Insights',
            description: 'Access detailed match analysis, expert opinions, and exclusive VIP predictions.',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            title: 'Multiple Payment Methods',
            description: 'Pay with credit cards, PayPal, crypto, or mobile money. Flexible subscription options.',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            gradient: 'from-cyan-500 to-orange-500'
        },
        {
            title: '24/7 Support',
            description: 'Get help anytime with our dedicated customer support team and community forum.',
            icon: (
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            ),
            gradient: 'from-violet-500 to-purple-500'
        },
    ]


    useEffect(() => {
        if (content && Array.isArray(content.titles)) {
            // Sort content.titles by their customtitle's index in defaulttitles
            const sortedTitles = [...content.titles].sort(
                (a, b) =>
                    defaulttitles.indexOf(a.defaulttitle.toLowerCase()) - defaulttitles.indexOf(b.defaulttitle.toLowerCase())
            );
            setTitle(sortedTitles);
        }

        if (content?.predictions?.length > 0) {
            setPredictions(content?.predictions || []);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content]);


    const updateTableTitle = async (index: number, name: string) => {
        let titlename = ""

        const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
            titlename = e.target.value
        }

        dialog.showDialog({
            title: "Update " + name,
            message: `If you really want to to update this tables tltle from ${name}, input the new table title name below`,
            type: "component",
            component: (
                <div className="my-4 w-full">
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 mt-2 select-all "
                        autoFocus
                        onFocus={e => e.target.select()}
                        placeholder="Enter new table title"
                        onChange={handleTitleChange}
                    />
                </div>
            ),
            async onConfirm() {
                if (!titlename && titlename.length < 5 && titlename.toLowerCase() === titlename.toLowerCase()) {
                    toast.error('Your title should be longer enough or should not be the same title as before.')
                } else {

                    const updatedTitles = [...title];
                    updatedTitles[index] = { ...updatedTitles[index], defaulttitle: titlename };
                    setTitle(updatedTitles);
                    await updateTitle(title[index].id, titlename)
                    titlename = ""
                }
            },

        })
    }


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
                    console.log("Prediction updated successfully:", newresult);
                    // setPredictions(result);
                } catch (error) {
                    setUpdating(false);
                    console.error("Error updating prediction:", error);
                }

            }
        })
    }


    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="flex flex-col justify-center items-center relative min-h-[65vh] md:min-h-[80vh] 2xl:min-h-[95vh] 3xl:min-h-[90vh] bg-gradient-to-r from-neutral-600/40 to-neutral-800/40 text-white w-full bg-url(/stadium.webp) bg-cover bg-center"
                style={{
                    backgroundImage: 'linear-gradient(to right, #1a1818c0, #111010cb), url(/stadium.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>

                <div className="flex items-center justify-center w-full my-auto container px-4 py-8 mt-24 md:mt-16 h-full overflow-hidden">
                    <div className="w-full flex items-center justify-center flex-col lg:flex-row lg:justify-between gap-2 h-full">
                        <div className="flex flex-col w-full h-full justify-center lg:w-1/2 text-center lg:text-left z-20 gap-4 ">
                            <p className="text-xl sm:text-3xl md:text-5xl font-thin italic text-white ">Welcome, {user?.username || "User"}</p>

                            <h1 className="text-3xl md:text-5xl lg:text-5xl 2xl:text-7xl font-bold sm:leading-16 md:leading-20 lg:leading-16 2xl:leading-24 lg:mt-8 ">
                                Welcome to the Expert ChrisWrldArena <span className="text-orange-400">Odds </span> Hub!
                            </h1>
                            <p className="text-sm sm:text-lg md:text-base text-white mt-4 sm:mt-8">
                                Join thousands of successful bettors who trust our expert analysis and predictions.
                                Get access to premium tips and increase your winning potential.
                            </p>
                            <div className="flex flex-col lg:flex-row items-center justify-center">
                                <div className="flex flex-col xl:flex-row justify-center items-center lg:justify-start gap-4 pt-4 w-full lg:mt-8">
                                    <Link
                                        href="https://t.me/bigboyzg" target='_blank'
                                        className="flex bg-orange-500 uppercase w-72 font-bold justify-center items-center gap-2 hover:scale-[1.05] transition-all text-white px-4 py-2 rounded-lg text-xs sm:text-base text-center"
                                    >
                                        <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.227-.535.227l.19-2.712 4.94-4.465c.215-.19-.047-.296-.332-.106l-6.103 3.854-2.623-.816c-.57-.18-.582-.57.12-.843l10.238-3.948c.473-.174.887.104.605 1.337z" />
                                        </svg>
                                        Join Telegram Channel
                                    </Link>
                                    <Link
                                        href="/pricing"
                                        className="flex justify-center relative bg-orange-500 w-72 uppercase border border-orange-500 gap-2 items-center hover:scale-[1.05] transition-all text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-base text-center"
                                    >
                                        <svg className="size-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                d="M2 8l4 10h12l4-10-6 5-4-7-4 7-6-5z"
                                                fill="white"
                                                stroke="white"
                                                strokeWidth="1"
                                            />
                                            <circle cx="4" cy="8" r="1.5" fill="white" />
                                            <circle cx="12" cy="4" r="1.5" fill="white" />
                                            <circle cx="20" cy="8" r="1.5" fill="white" />
                                        </svg>
                                        Get Vip Games
                                        <div className="absolute top-2 right-2">
                                            <div className="relative w-2 h-2">
                                                <div className="absolute inset-0 rounded-full bg-orange-100 opacity-0 group-hover:scale-[6] group-hover:opacity-10 transition-all duration-500" />
                                                <div className="absolute inset-0 rounded-full bg-orange-100 animate-ping group-hover:opacity-0 transition-opacity" />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>

                        </div>
                        <div className="hidden lg:block w-full lg:w-1/2 px-4 sm:px-8 lg:px-0">
                            <div className="relative max-w-[500px] mx-auto lg:max-w-none">
                                <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-400/20 rounded-full blur-xl animate-pulse" />
                                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
                                <img src="/hero-img.png"
                                    alt="Sports prediction illustration"
                                    className="object-cover hover:scale-[1.02] transition-all duration-500" />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Recent Predictions Section */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col space-y-12">
                        {/* Section Header */}
                        <div className="text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Expert Predictions
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
                                Access our winning predictions with proven success rates. Upgrade to VIP for premium insights.
                            </p>
                        </div>

                        <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="flex flex-col w-full xl:col-span-2 gap-16">
                                {/* VIP Predictions */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-200">
                                        <div className="relative flex flex-col lg:flex-row gap-4 items-center justify-between">
                                            <span className="absolute left-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-400 text-gray-900">
                                                Premium
                                            </span>
                                            <h3 className="text-sm sm:text-xl font-bold text-white flex items-center gap-2 ml-20 uppercase">
                                                {title[0]?.defaulttitle || defaulttitles[0]}
                                                {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-400 text-gray-900"
                                                    onClick={() => updateTableTitle(0, title[0]?.defaulttitle || defaulttitles[0])}>
                                                    <Edit2 className="size-4" />&nbsp;Edit
                                                </span>}
                                            </h3>

                                        </div>
                                    </div>
                                    <div className="">
                                        {!content.isSubscriptionActive && <div className="grid gap-6 md:grid-cols-2 p-6">
                                            {/* VIP Features */}
                                            <div className="space-y-4">
                                                <h4 className="font-medium text-gray-900">Premium Features</h4>
                                                {[
                                                    'Exclusive high-probability predictions',
                                                    'Detailed match analysis',
                                                    'In-depth statistics',
                                                    'Expert betting strategies',
                                                    'Priority support',
                                                    'Early access to tips'
                                                ].map((feature, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-gray-600">
                                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Preview (Blurred) */}
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
                                                    {!content.isSubscriptionActive && <div className="text-center">
                                                        <div className="w-12 h-12 mx-auto mb-4 text-orange-400">
                                                            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </div>
                                                        <p className="font-medium text-gray-900">Unlock Premium Content</p>
                                                        <p className="text-sm text-gray-600 mt-1">Subscribe to access VIP predictions</p>
                                                    </div>}
                                                    {content.isSubscriptionActive && <div className="text-center">
                                                        <div className="w-12 h-12 mx-auto mb-4 text-orange-400">
                                                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
                                                                <path
                                                                    d="M2 8l4 10h12l4-10-6 5-4-7-4 7-6-5z"
                                                                    fill="#FFD700"
                                                                    stroke="#FBBF24"
                                                                    strokeWidth="1"
                                                                />
                                                                <circle cx="4" cy="8" r="1.5" fill="#FFD700" />
                                                                <circle cx="12" cy="4" r="1.5" fill="#FFD700" />
                                                                <circle cx="20" cy="8" r="1.5" fill="#FFD700" />
                                                            </svg>
                                                        </div>
                                                        <p className="font-medium text-gray-900">Unlock Premium Content</p>
                                                        <p className="text-sm text-gray-600 mt-1">Use the button below to view VIP predictions and analysis</p>
                                                        <br />
                                                        <Link
                                                            href="/pricing"
                                                            className="px-4 py-2 mt-16 text-sm font-medium text-gray-900 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-300"
                                                        >
                                                            Goto Premium Predictions
                                                        </Link>
                                                    </div>}
                                                </div>
                                                <div className="space-y-4">
                                                    {[1, 2].map((index) => (
                                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="w-1/2 h-4 bg-gray-200 rounded" />
                                                                <div className="w-16 h-4 bg-gray-200 rounded" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="w-3/4 h-3 bg-gray-200 rounded" />
                                                                <div className="w-2/3 h-3 bg-gray-200 rounded" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>}
                                        {content.isSubscriptionActive && <div className=" bg-white rounded-xl overflow-hidden h-max">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                                            {user?.role === "ADMIN" && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {currentPredictions
                                                            .filter(prediction => prediction.result === "PENDING")
                                                            .slice(0, 5)
                                                            .map((prediction, index) => (
                                                                <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-neutral-100">
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                                                        {moment(prediction.publishedAt).format('LL')}
                                                                        <br />
                                                                        {moment(prediction.publishedAt).format('LT')}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {prediction.sportType} &bull; {prediction.league || 'Unknown League'}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 w-44 truncate">
                                                                            {prediction.homeTeam} vs {prediction.awayTeam}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 w-20 truncate">
                                                                        {prediction.tip || 'No prediction available'}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                        <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                                                                            {prediction.odds || 'N/A'}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                        {updating && index === currentposition && <LoaderCircle className="animate-spin size-4" />}

                                                                        {!updating && <>
                                                                            {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                Won ✓
                                                                            </span>}
                                                                            {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                                Lost ✗
                                                                            </span>}
                                                                            {prediction.result === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                                Pending ⏳
                                                                            </span>}
                                                                        </>}
                                                                    </td>

                                                                    {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                        <td className="relative px-4 py-2 flex gap-2 items-center justify-end">

                                                                            <Popover>
                                                                                <PopoverTrigger asChild>
                                                                                    <button
                                                                                        className="focus:outline-none"
                                                                                        tabIndex={0}
                                                                                        aria-label="Show actions"
                                                                                        type="button"
                                                                                    >
                                                                                        <MoreVertical
                                                                                            className="text-neutral-500 cursor-pointer hover:text-neutral-600 size-5"
                                                                                        />
                                                                                    </button>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent align="end" className="z-50 p-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                                                                                    <div className="flex flex-col">
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                updateWLPrediction(index, prediction, 'WON');
                                                                                            }}
                                                                                        >
                                                                                            <Check className="w-4 h-4 text-neutral-500" />
                                                                                            Won
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                updateWLPrediction(index, prediction, 'LOST');
                                                                                            }}
                                                                                        >
                                                                                            <X className="w-4 h-4 text-neutral-500" />
                                                                                            Lost
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                updateWLPrediction(index, prediction, 'PENDING');
                                                                                            }}
                                                                                        >
                                                                                            <Clock className="w-4 h-4 text-gray-500" />
                                                                                            Pending
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                                                                                            }}
                                                                                        >
                                                                                            <Edit className="w-4 h-4 text-gray-500" />
                                                                                            Edit
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                                            onClick={() => deletePrediction(index, prediction.id)}
                                                                                        >
                                                                                            <Trash className="w-4 h-4 text-red-500" />
                                                                                            Delete
                                                                                        </button>
                                                                                    </div>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        </td>}




                                                                </tr>
                                                            ))}

                                                    </tbody>

                                                </table>

                                            </div>
                                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                                <div className="flex items-center justify-center">
                                                    <Link
                                                        href="/pricing"
                                                        className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300"
                                                    >
                                                        {content.isSubscriptionActive ? "View All" : !user ? "Sign in to View" : "Upgrade to VIP"}
                                                    </Link>
                                                    {user?.role === "ADMIN" && <Link
                                                        href={user ? "/dashboard/predictions/create" : "/signin"}
                                                        className=" text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300"
                                                    >
                                                        <PlusCircle className='text-orange-500 size-5 hover:text-gray-900' />
                                                        {!user && "Sign in to View"}
                                                    </Link>}
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                </div>

                                {/* Custom Predictions */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="relative p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-200">
                                        <div className="relative flex flex-col lg:flex-row gap-4 items-center justify-between">
                                            <h3 className="text-sm sm:text-xl font-bold text-white flex uppercase justify-center gap-2 ">
                                                {title[1]?.defaulttitle || defaulttitles[1]}
                                                {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-400 text-gray-900"
                                                    onClick={() => updateTableTitle(1, title[1]?.defaulttitle || defaulttitles[1])}>
                                                    <Edit2 className="size-4" />&nbsp;Edit
                                                </span>}
                                            </h3>


                                        </div>
                                    </div>
                                    <div className="">

                                        {content.isSubscriptionActive && <div className=" bg-white rounded-xl overflow-hidden h-max">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {currentPredictions
                                                            .filter(prediction => prediction.result === "PENDING" && prediction.isCustom)
                                                            .slice(0, 5)
                                                            .map((prediction, index) => (
                                                                <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-neutral-100">
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                                                        {moment(prediction.publishedAt).format('LL')}
                                                                        <br />
                                                                        {moment(prediction.publishedAt).format('LT')}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {prediction.sportType} &bull; {prediction.league || 'Unknown League'}
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 w-44 truncate">
                                                                            {prediction.homeTeam} vs {prediction.awayTeam}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 w-20 truncate">
                                                                        {prediction.tip || 'No prediction available'}
                                                                    </td>
                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                        <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                                                                            {prediction.odds || 'N/A'}
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-4 py-2 whitespace-nowrap">
                                                                        {updating && index === currentposition && <LoaderCircle className="animate-spin size-4" />}

                                                                        {!updating && <>
                                                                            {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                                Won ✓
                                                                            </span>}
                                                                            {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                                Lost ✗
                                                                            </span>}
                                                                            {prediction.result === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                                Pending ⏳
                                                                            </span>}
                                                                        </>}
                                                                    </td>
                                                                    {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                        <td className="relative px-4 py-2 flex gap-2 items-center justify-end">

                                                                            <Popover>
                                                                                <PopoverTrigger asChild>
                                                                                    <button
                                                                                        className="focus:outline-none"
                                                                                        tabIndex={0}
                                                                                        aria-label="Show actions"
                                                                                        type="button"
                                                                                    >
                                                                                        <MoreVertical
                                                                                            className="text-neutral-500 cursor-pointer hover:text-neutral-600 size-5"
                                                                                        />
                                                                                    </button>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent align="end" className="z-50 p-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                                                                                    <div className="flex flex-col">
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                updateWLPrediction(index, prediction, 'WON');
                                                                                            }}
                                                                                        >
                                                                                            <Check className="w-4 h-4 text-neutral-500" />
                                                                                            Won
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                updateWLPrediction(index, prediction, 'LOST');
                                                                                            }}
                                                                                        >
                                                                                            <X className="w-4 h-4 text-neutral-500" />
                                                                                            Lost
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                updateWLPrediction(index, prediction, 'PENDING');
                                                                                            }}
                                                                                        >
                                                                                            <Clock className="w-4 h-4 text-gray-500" />
                                                                                            Pending
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={() => {
                                                                                                window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                                                                                            }}
                                                                                        >
                                                                                            <Edit className="w-4 h-4 text-gray-500" />
                                                                                            Edit
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                                            onClick={() => deletePrediction(index, prediction.id)}
                                                                                        >
                                                                                            <Trash className="w-4 h-4 text-red-500" />
                                                                                            Delete
                                                                                        </button>
                                                                                    </div>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        </td>}

                                                                </tr>
                                                            ))}
                                                        {currentPredictions.filter(prediction => prediction.result === "PENDING" && prediction.isCustom).length === 0 && (
                                                            <tr>
                                                                <td colSpan={5} className="text-center text-gray-400 py-6">
                                                                    No custom predictions available.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="p-4 border-t border-gray-200 bg-gray-50">

                                                <div className="flex items-center justify-center ">
                                                    <Link
                                                        href="/predictions/custom"
                                                        className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300">
                                                        {!user ? "Sign in to View" : "View All Matches"}
                                                    </Link>
                                                    {user?.role === "ADMIN" && <Link
                                                        href={user ? "/dashboard/predictions/create" : "/signin"}
                                                        className=" text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300"
                                                    >
                                                        <PlusCircle className='text-orange-500 size-5 hover:text-gray-900' />
                                                        {!user && "Sign in to View"}
                                                    </Link>}
                                                </div>
                                            </div>
                                        </div>}
                                    </div>
                                </div>

                                {/* Previousely won odds */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="flex flex-col lg:flex-row gap-4 p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-200">
                                        <h3 className="text-base sm:text-xl font-bold text-white flex uppercase items-center gap-2">
                                            {title[2]?.defaulttitle || defaulttitles[2]}
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-400 text-gray-900"
                                                onClick={() => updateTableTitle(2, title[2]?.defaulttitle || defaulttitles[2])}>
                                                <Edit2 className="size-4" />&nbsp;Edit
                                            </span>}
                                        </h3>

                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {currentPredictions
                                                    .filter(prediction => prediction.result !== "PENDING")
                                                    .slice(0, 10)
                                                    .map((prediction, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 transition-colors odd:bg-neutral-100">
                                                            <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                                                                {moment(prediction.publishedAt).format('LL')}
                                                                <br />
                                                                {moment(prediction.publishedAt).format('LT')}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                                                    {prediction.sportType} &bull; {prediction.league || 'Unknown League'}
                                                                </div>
                                                                <div className="text-xs sm:text-sm text-gray-600 w-44 truncate">
                                                                    {prediction.homeTeam} vs {prediction.awayTeam}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 w-20 truncate">
                                                                {prediction.isFree ? "Free Odds" : "VIP Prediction"}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 w-20 truncate">
                                                                {prediction.tip || 'No prediction available'}
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                <span className="px-2 py-1 text-xs font-medium text-neutral-800 bg-neutral-100 rounded-full">
                                                                    {prediction.odds || 'N/A'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 whitespace-nowrap">
                                                                {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : " Won ✓"}
                                                                </span>}
                                                                {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Lost ✗"}
                                                                </span>}

                                                            </td>
                                                            {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                <td className="relative px-4 py-2 flex gap-2 items-center justify-end">

                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button
                                                                                className="focus:outline-none"
                                                                                tabIndex={0}
                                                                                aria-label="Show actions"
                                                                                type="button"
                                                                            >
                                                                                <MoreVertical
                                                                                    className="text-neutral-500 cursor-pointer hover:text-neutral-600 size-5"
                                                                                />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent align="end" className="z-50 p-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                                                                            <div className="flex flex-col">
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        updateWLPrediction(index, prediction, 'WON');
                                                                                    }}
                                                                                >
                                                                                    <Check className="w-4 h-4 text-neutral-500" />
                                                                                    Won
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        updateWLPrediction(index, prediction, 'LOST');
                                                                                    }}
                                                                                >
                                                                                    <X className="w-4 h-4 text-neutral-500" />
                                                                                    Lost
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        updateWLPrediction(index, prediction, 'PENDING');
                                                                                    }}
                                                                                >
                                                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                                                    Pending
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        window.location.href = `/dashboard/predictions/update/?id=${prediction.id}`;
                                                                                    }}
                                                                                >
                                                                                    <Edit className="w-4 h-4 text-gray-500" />
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                                    onClick={() => deletePrediction(index, prediction.id)}
                                                                                >
                                                                                    <Trash className="w-4 h-4 text-red-500" />
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </td>}
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-center ">
                                            <Link
                                                href="/predictions/previousgames"
                                                className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300">
                                                {!user ? "Sign in to View" : "View All Matches"}
                                            </Link>
                                            {user?.role === "ADMIN" && <Link
                                                href={user ? "/dashboard/predictions/create" : "/signin"}
                                                className=" text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300"
                                            >
                                                <PlusCircle className='text-orange-500 size-5 hover:text-gray-900' />
                                                {!user && "Sign in to View"}
                                            </Link>}
                                        </div>
                                    </div>
                                </div>

                                {/* Free Hot Odds */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="flex flex-col lg:flex-row gap-4 p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-200">
                                        <h3 className="text-base sm:text-xl font-bold text-white uppercase flex items-center gap-2">
                                            {title[3]?.defaulttitle || defaulttitles[3]}
                                            {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-400 text-gray-900"
                                                onClick={() => updateTableTitle(3, title[3]?.defaulttitle || defaulttitles[3])}>
                                                <Edit2 className="size-4" />&nbsp;Edit
                                            </span>}
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Live
                                            </span>
                                        </h3>


                                    </div>
                                    <div className="p-0">
                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                                            {/* <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-bold text-gray-900 text-xs sm:">Today's Special Bet Slip</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs sm:text-sm font-medium text-gray-500">Code:</span>
                                                    <span suppressHydrationWarning className="text-xs sm:text-sm font-mono font-bold text-orange-600">HOT-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                                                </div>
                                            </div> */}
                                            <div className="space-y-3">
                                                {predictions
                                                    .filter((bet) => bet.result === "PENDING" && !bet.isCustom)
                                                    .slice(0, 5)
                                                    .map((bet, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-orange-200 px-4">
                                                            <div>
                                                                <p className="font-thin text-gray-900"></p>
                                                                <p className="text-xs sm:text-sm font-medium text-gray-900"> <span className='text-violet-500'>{bet.league} &bull; <br /> </span>{bet.homeTeam} vrs {bet.awayTeam}</p>
                                                                <p className="text-xs sm:text-sm text-gray-600">{bet.tip}</p>
                                                            </div>
                                                            <div className="px-4 py-2 whitespace-nowrap">
                                                                {updating && index === currentposition && <LoaderCircle className="animate-spin size-4" />}

                                                            </div>
                                                            <div className="flex text-right gap-4">
                                                                <div className="">
                                                                    <p className="font-bold text-green-600"><span className='text-neutral-500 text-sm font-normal'>Odd: </span>{bet.odds}</p>
                                                                    <p className="text-sm text-gray-500">{moment(bet.publishedAt).format("LLL")}</p>
                                                                </div>
                                                                {predictions.length > 0 && user?.role === "ADMIN" && !loading &&


                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <button
                                                                                className="focus:outline-none"
                                                                                tabIndex={0}
                                                                                aria-label="Show actions"
                                                                                type="button"
                                                                            >
                                                                                <MoreVertical
                                                                                    className="text-neutral-500 cursor-pointer hover:text-neutral-600 size-5"
                                                                                />
                                                                            </button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent align="end" className="z-50 p-0 w-40 bg-white border border-gray-200 rounded shadow-lg">
                                                                            <div className="flex flex-col">
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        updateWLPrediction(index, bet, 'WON');
                                                                                    }}
                                                                                >
                                                                                    <Check className="w-4 h-4 text-neutral-500" />
                                                                                    Won
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        updateWLPrediction(index, bet, 'LOST');
                                                                                    }}
                                                                                >
                                                                                    <X className="w-4 h-4 text-neutral-500" />
                                                                                    Lost
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        updateWLPrediction(index, bet, 'PENDING');
                                                                                    }}
                                                                                >
                                                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                                                    Pending
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={() => {
                                                                                        window.location.href = `/dashboard/predictions/update/?id=${bet.id}`;
                                                                                    }}
                                                                                >
                                                                                    <Edit className="w-4 h-4 text-gray-500" />
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                                    onClick={() => deletePrediction(index, bet.id)}
                                                                                >
                                                                                    <Trash className="w-4 h-4 text-red-500" />
                                                                                    Delete
                                                                                </button>
                                                                            </div>
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                }
                                                            </div>

                                                        </div>
                                                    ))}
                                                <div className="flex items-center justify-center ">
                                                    <Link
                                                        href="/predictions/freegames"
                                                        className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300">
                                                        {!user ? "Sign in to View" : "View All Matches"}
                                                    </Link>
                                                    {user?.role === "ADMIN" && <Link
                                                        href={user ? "/dashboard/predictions/create" : "/signin"}
                                                        className=" text-sm font-medium text-gray-900 hover:text-orange-600 transition-all duration-300"
                                                    >
                                                        <PlusCircle className='text-orange-500 size-5 hover:text-gray-900' />
                                                        {!user && "Sign in to View"}
                                                    </Link>}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Midnight Oracle */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="p-6 bg-gradient-to-r from-purple-50 to-white border-b border-gray-200">
                                        <h3 className="text-xs sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                                            {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-200 text-gray-900"
                                                onClick={() => updateTableTitle(4, title[4]?.defaulttitle || defaulttitles[4])}>
                                                <Edit2 className="size-4" />&nbsp;Edit
                                            </span>}
                                            {title[4]?.defaulttitle || defaulttitles[4]}
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {new Date().getHours() >= 0 && new Date().getHours() < 5 ? 'Active' : 'Returns at Midnight'}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {new Date().getHours() >= 0 && new Date().getHours() < 5 ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                                        <p className="text-xs sm:text-lg font-medium text-purple-900">Special Midnight Predictions</p>
                                                    </div>
                                                    <table className="w-full mt-4">
                                                        <thead className="bg-purple-100/50">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-900">Match</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-900">Prediction</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-purple-900">Odds</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-purple-100">
                                                            {predictions
                                                                .filter((bet) => bet.result === "PENDING" && bet.isFree && bet.isCustom)
                                                                .slice(0, 5).map((game, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">{game.homeTeam} vrs {game.awayTeam} <br /> {moment(game.publishedAt).format("LLL")}</td>
                                                                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">{game.tip}</td>
                                                                        <td className="px-4 py-3 text-xs sm:text-sm font-medium text-purple-700">{game.odds}</td>
                                                                    </tr>
                                                                ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="w-20 h-20 mx-auto mb-6 text-gray-400">
                                                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-xs sm:text-xl font-medium text-gray-900 mb-2">Predictions Unavailable</h3>
                                                <p className="text-xs sm:text-base text-gray-600">Our Midnight Oracle predictions are only available from 12 AM to 5 AM.</p>
                                                <p className="text-xs sm:text-sm text-purple-600 mt-2">Returns in {23 - new Date().getHours()} hours - {60 - new Date().getMinutes()} mins</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col w-full lg:col-span-2 xl:col-span-1 rounded-xl bg-white shadow-sm p-4 sm:p-6 h-max relative gap-8">

                                {/* Gradient Border */}
                                <div className="absolute inset-0 rounded-xl pointer-events-none z-0" style={{
                                    padding: '2px',
                                    background: 'linear-gradient(135deg, #101828 0%, #1e2939 50%, #f59e42 100%)'
                                }} />
                                <div className="relative z-10 bg-white rounded-xl p-4 sm:p-8 lg:p-4 w-full">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Major Sporting Games</h1>
                                    <p className="text-xs sm:textbase text-neutral-400 text-center mt-1">We are glad to offer you popolur and even less popular range of sporting activies accross the globe</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 flex-col mt-8 gap-4">
                                        {sportTypeOptions.slice(0, -1).map((sport) => (
                                            <p className={`text-xs sm:text-sm md:text-base text-black hover:text-orange-500 transition-all delay-300 cursor-default hover:scale-[1.1] font-semibold `}
                                                key={sport.label}
                                                onClick={() => setGames(sport.label.toLowerCase())}
                                                onMouseEnter={() => setGames(sport.label.toLowerCase())}
                                            >&bull; {sport.label}
                                            </p>
                                        ))}
                                    </div>
                                    <div className="mt-8 p-2 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-900 text-xs sm:text-sm text-center">
                                        <strong>Betting Advice:</strong> Please gamble responsibly. Only bet what you can afford to lose. Our predictions are based on expert analysis, but no outcome is guaranteed. If you feel your betting is becoming a problem, seek help from a professional or visit a responsible gambling resource.
                                    </div>
                                </div>

                                <h1 className="text-white z-10 text-center font-bold">{games.toUpperCase()}</h1>

                                {/* Gradient Border */}
                                <div className="absolute inset-0 rounded-xl pointer-events-none z-0" style={{
                                    padding: '2px',
                                    background: 'linear-gradient(135deg, #101828 0%, #1e2939 50%, #f59e42 100%)'
                                }} />
                                <div className="relative z-10 bg-white rounded-xl p-4 sm:p-8 lg:p-4 w-full">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Major {games.toUpperCase()} Games</h1>
                                    <div className="flex flex-wrap mt-8 gap-4">
                                        {sportTypeOptions.find((sport) => sport.label.toLowerCase() === games)?.league.slice(0, -1).map((sport) => (
                                            <p className="text-xs md:text-sm text-black hover:text-orange-500 transition-all delay-300 cursor-default" key={sport.label}> &bull; {sport.label}</p>
                                        ))}
                                    </div>

                                </div>
                            </div>

                            {/* TODO: duplicate to make adds */}
                        </div>
                    </div>
                </div>
            </section >


            {/* Features Section */}
            < section className="py-20 relative overflow-hidden" >
                {/* Background Elements */}
                < div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-white z-0" >
                    <div className="absolute inset-0 bg-[linear-gradient(30deg,#00000000_0%,#0000000a_50%,#00000000_100%)] bg-[length:5px_5px]" />
                </div >

                {/* Animated Background Shapes */}
                < div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="absolute top-1/2 right-0 w-72 h-72 bg-orange-200 rounded-full blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-32 left-0 w-72 h-72 bg-red-200 rounded-full blur-2xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }} />

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 border-2 border-orange-200 rounded-lg rotate-45 animate-spin-slow" />
                <div className="absolute bottom-10 right-10 w-20 h-20 border-2 border-orange-200 rounded-lg rotate-45 animate-spin-slow" style={{ animationDirection: 'reverse' }} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-16 relative">
                        <div className="inline-block">
                            <div className="relative">
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 relative z-10">
                                    Why Choose <span className="text-orange-600">ChrisWrldArena</span>?
                                </h2>
                                <div className="absolute -top-6 -right-6 w-20 h-20 bg-orange-200 rounded-full blur-xl opacity-30 animate-pulse" />
                                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-orange-200 rounded-full blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
                            </div>
                        </div>
                        <p className="mt-4 text-sm sm:text-xl text-gray-600 max-w-3xl mx-auto">
                            Experience the perfect blend of expert analysis, cutting-edge technology, and premium features
                        </p>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-1 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-50" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 transform -skew-y-12" />
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative bg-white/70 backdrop-blur-sm p-4 sm:p-8 rounded-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 shadow overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-all duration-500`} />
                                <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Animated Corner Effects */}
                                <div className="absolute top-0 left-0 w-16 h-16 -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                                    <div className="absolute top-0 left-0 w-[2px] h-8 bg-gradient-to-b from-transparent via-orange-500 to-transparent" />
                                    <div className="absolute top-0 left-0 h-[2px] w-8 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                                </div>

                                <div className="absolute bottom-0 right-0 w-16 h-16 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700">
                                    <div className="absolute bottom-0 right-0 w-[2px] h-8 bg-gradient-to-t from-transparent via-orange-500 to-transparent" />
                                    <div className="absolute bottom-0 right-0 h-[2px] w-8 bg-gradient-to-l from-transparent via-orange-500 to-transparent" />
                                </div>

                                <div className="relative">
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-md">
                                        <div className="transform group-hover:scale-110 transition-transform duration-500">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                                        {feature.title}
                                    </h3>
                                    <p className="text-xs sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Animated Dots */}
                                <div className="absolute top-4 right-4">
                                    <div className="relative w-2 h-2">
                                        <div className="absolute inset-0 rounded-full bg-orange-400 opacity-0 group-hover:scale-[6] group-hover:opacity-10 transition-all duration-500" />
                                        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping group-hover:opacity-0 transition-opacity" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >


            {/* CTA Section */}
            < section className="relative py-20 overflow-hidden" >
                {/* Gradient Background */}
                < div className="absolute inset-0 bg-gradient-to-br from-neutral-600 via-neutral-700 to-neutral-900" >
                    {/* Animated Pattern Overlay */}
                    < div className="absolute inset-0 bg-[linear-gradient(45deg,#ffffff0a_1px,#0000_1px),linear-gradient(-45deg,#ffffff0a_1px,#0000_1px)] bg-[size:40px_40px] animate-[grain_8s_steps(10)_infinite]" />

                    {/* Animated Shapes */}
                    < div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-neutral-400/20 to-transparent rounded-full blur-3xl animate-shape-1" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl animate-shape-2" />
                </div >

                <div className="container mx-auto px-4 text-center relative z-10">
                    {/* Glowing Effect */}
                    <div className="relative inline-block mb-6">
                        <div className="absolute -inset-1  group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                        <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-2">
                            Ready to Start Winning?
                        </h2>
                    </div>

                    <p className="text-base sm:text-xl text-orange-100 mb-12 max-w-2xl mx-auto">
                        Join thousands of successful bettors who are already profiting from our expert predictions.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            href="/signup"
                            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium tracking-wider text-gray-900 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all duration-300"
                        >
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-orange-600/20 rounded-full group-hover:w-64 group-hover:h-64"></span>
                            <span className="relative font-semibold">Get Started Now</span>
                        </Link>

                        <Link
                            href="/pricing"
                            className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/30"
                        >
                            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white/10 rounded-full group-hover:w-64 group-hover:h-64"></span>
                            <span className="relative font-semibold">Subscribe Now!</span>
                        </Link>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
                        {[
                            { label: "Subscribers", value: "10000", start: "500", suffix: "+" },
                            { label: "Success Rate", value: "98", start: "10", suffix: "%" },
                            { label: "Expert Tips", value: "50000", start: "500", suffix: "+" },
                            { label: "Avg. ROI", value: "127", start: "10", suffix: "%" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center bg-orange-200/10 backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-orange-500/50">
                                <p suppressHydrationWarning className="text-xl md:text-3xl font-bold text-white mb-2">
                                    <span suppressHydrationWarning className="inline-block" data-start={stat.start} data-end={stat.value}>
                                        {stat.value}
                                    </span>
                                    {stat.suffix}
                                </p>
                                <p className="text-orange-100 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Add this script tag to the end of your component */}
                    <script dangerouslySetInnerHTML={{
                        __html: `
                                function animateValue(element, start, end, duration) {
                                let current = start;
                                const range = end - start;
                                const increment = range / (duration / 16);
                                const timer = setInterval(() => {
                                    current += increment;
                                    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                                    current = end;
                                    clearInterval(timer);
                                    }
                                    element.textContent = Math.round(current);
                                }, 16);
                                }

                                const observer = new IntersectionObserver((entries) => {
                                entries.forEach(entry => {
                                    if (entry.isIntersecting) {
                                    const element = entry.target;
                                    const start = parseInt(element.dataset.start);
                                    const end = parseInt(element.dataset.end);
                                    animateValue(element, start, end, 2000);
                                    observer.unobserve(element);
                                    }
                                });
                                }, { threshold: 0.5 });

                                document.querySelectorAll('[data-start]').forEach(element => {
                                observer.observe(element);
                                });
                            `
                    }} />
                </div>
            </section >

            {/* Testimonials Section */}
            < section className="py-12 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 relative overflow-hidden" >
                {/* Animated Background Elements */}
                < div className="absolute inset-0" >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#e5e7eb,transparent)]" />
                    <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-orange-50/30 to-transparent" />
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-orange-50/20 to-transparent" />
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-100/20 to-transparent rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-100/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
                </div >

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <div className="inline-block">
                            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
                                Voices of Success
                            </h2>
                            <div className="h-1 w-32 bg-gradient-to-r from-orange-500 to-orange-500 rounded-full mx-auto" />
                        </div>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-6">
                            Join our community of successful bettors and experience the difference
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
                        {[
                            {
                                name: "John Smith",
                                role: "Professional Bettor",
                                location: "United Kingdom",
                                avatar: "/avatars/default_img.webp",
                                quote: "ChrisWrldArena has completely transformed my betting strategy. The accuracy of predictions is simply remarkable!",
                                rating: 5,
                                winRate: "92%",
                                gradientFrom: "from-orange-500",
                                gradientTo: "to-orange-600"
                            },
                            {
                                name: "Maria Rodriguez",
                                role: "Sports Analyst",
                                location: "Spain",
                                avatar: "/avatars/default_img.webp",
                                quote: "The premium insights have been invaluable. My success rate has improved significantly since joining.",
                                rating: 5,
                                winRate: "88%",
                                gradientFrom: "from-orange-500",
                                gradientTo: "to-orange-600"
                            },
                            {
                                name: "David Chen",
                                role: "VIP Member",
                                location: "Singapore",
                                avatar: "/avatars/default_img.webp",
                                quote: "Best prediction service I've used. The combination of AI analysis and expert insights is unmatched.",
                                rating: 5,
                                winRate: "90%",
                                gradientFrom: "from-purple-500",
                                gradientTo: "to-purple-600"
                            }
                        ].map((testimonial, index) => (
                            <div
                                key={index}
                                className="group relative bg-neutral-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                            >
                                {/* Gradient Border Effect */}
                                {/* <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur" /> */}

                                {/* Success Badge */}
                                <div className={`absolute -top-4 right-8 bg-gradient-to-r ${testimonial.gradientFrom} ${testimonial.gradientTo} text-white text-sm font-medium px-4 py-2 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
                                    {testimonial.winRate} Success Rate
                                </div>

                                {/* Quote */}
                                <div className="mb-8 relative">
                                    <svg className="absolute -top-4 -left-2 w-8 h-8 text-gray-200 transform -rotate-12" fill="currentColor" viewBox="0 0 32 32">
                                        <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                                    </svg>
                                    <p className="text-gray-700 text-lg relative z-10 pl-6">{testimonial.quote}</p>
                                </div>

                                {/* User Info */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-gray-200 rounded-full overflow-hidden ring-2 ring-offset-2 ring-gray-100">
                                            <Image
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                width={56}
                                                height={56}
                                                className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full border-2 border-white flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                                        <p className="text-sm text-orange-600 font-medium">{testimonial.role}</p>
                                        <p className="text-sm text-gray-500">{testimonial.location}</p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="absolute bottom-6 right-8">
                                    <div className="flex gap-1">
                                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* Contact Section */}
            < section className="py-8 bg-neutral-500 w-full mx-auto" >
                <div className="flex flex-col container items-center justify-center mx-auto px-4 w-full gap-8">

                    <div className="flex items-center gap-4">
                        <a href="tel:+233542810847" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors">
                                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            {/* <span className="text-gray-700 font-medium">Join our Telegram Channel</span> */}
                        </a>
                        <a href="mailto:contact@chriswrldarena.com" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3  bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors">
                                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            {/* <span className="text-gray-700 font-medium">Join our Telegram Channel</span> */}
                        </a>
                        <a href="https://t.me/bigboyzg" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors">
                                <svg className="w-5 h-5 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.227-.535.227l.19-2.712 4.94-4.465c.215-.19-.047-.296-.332-.106l-6.103 3.854-2.623-.816c-.57-.18-.582-.57.12-.843l10.238-3.948c.473-.174.887.104.605 1.337z" />
                                </svg>
                            </div>
                            {/* <span className="text-gray-700 font-medium">Join our Telegram Channel</span> */}
                        </a>
                        <a href="https://x.com/@SenaNick1" target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3  bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                            <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors">
                                <svg className="w-5 h-5 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </div>
                            {/* <span className="text-gray-700 font-medium">Join our Telegram Channel</span> */}
                        </a>

                    </div>
                    {/*  <div>
            <p className="text-gray-600 text-xs">Email</p>
          </div> */}


                </div>


            </section >

            {/* Payment Gateway Section */}
            < section className="py-10 bg-neutral-200" >
                <div className="container mx-auto px-4">
                    <div className="text-center my-8">

                        <div className="relative max-w-3xl mx-auto">
                            {/* Decorative Elements */}
                            {/* <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-400/20 rounded-full blur-xl animate-pulse" /> */}
                            {/* <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-orange-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} /> */}

                            {/* Image Container */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                                <Image
                                    src="/paymentmethods.png"
                                    alt="Payment Methods"
                                    width={800}
                                    height={400}
                                    className="w-full h-auto"
                                    priority
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            {/* Security Badge */}
                            {/* <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-neutral-500 px-4 py-3 rounded-full shadow-lg flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-sm font-medium text-white">100% Secure Payments</span>
                            </div> */}
                        </div>
                    </div>
                </div>
            </section >

        </div >
    )
}

export default HomePageComponent

