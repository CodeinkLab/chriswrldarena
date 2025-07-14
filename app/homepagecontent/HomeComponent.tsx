/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client'
import Link from 'next/link'
import Image from 'next/image'

import { Prediction } from '../lib/interface';
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { sportTypeOptions } from '../lib/formschemas/predictionForm';
import { Check, Clock, Edit, Edit2, LoaderCircle, Mail, MoreVertical, Phone, PlusCircle, Trash, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useDialog } from '../components/shared/dialog';
import { updateTitle } from '../actions/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover';
import { FaTelegram, FaTwitter } from 'react-icons/fa';

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
    const [updating, setUpdating] = useState<boolean>(false);
    const [currentposition, setCurrentPosition] = useState<number>(-1);
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState<Record<string, any>[]>([])

    const parentRef = useRef<HTMLDivElement>(null)


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
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            gradient: 'from-green-500 to-green-500'
        },
        {
            title: 'Real-Time Updates',
            description: 'Get instant notifications and live updates for matches, odds changes, and prediction results.',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-green-500 to-green-500'
        },
        {
            title: 'Secure Payments',
            description: 'Multiple payment options with bank-grade security. Easy subscriptions and instant access.',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            gradient: 'from-green-500 to-green-500'
        },
        {
            title: 'Premium Insights',
            description: 'Access detailed match analysis, expert opinions, and exclusive VIP predictions.',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            title: 'Multiple Payment Methods',
            description: 'Pay with credit cards, PayPal, crypto, or mobile money. Flexible subscription options.',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            ),
            gradient: 'from-cyan-500 to-green-500'
        },
        {
            title: '24/7 Support',
            description: 'Get help anytime with our dedicated customer support team and community forum.',
            icon: (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
            ),
            gradient: 'from-green-500 to-green-500'
        },
    ]

    const customgames = ['Bet of the Day', 'Correct Score', 'Draw Games']

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
                        className="w-full px-4 py-2 border border-green-400 rounded-lg  focus:ring-2 focus:ring-green-500 text-gray-900 mt-2 select-all "
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

                } catch (error) {
                    setUpdating(false);
                }

            }
        })
    }


    const VIPGames = currentPredictions.filter(prediction => prediction.result === "PENDING" && !prediction.isFree && !customgames.includes(prediction.customTitle!))
    const BetOfTheDayGames = currentPredictions.filter(prediction => prediction.result === "PENDING" && prediction.isCustom && prediction.isFree)
    const PrevWonGames = currentPredictions.filter(prediction => prediction.result !== "PENDING")
    const FreeGames = currentPredictions.filter(prediction => prediction.result !== "PENDING" && prediction.isFree)


    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="md:px-8 flex flex-col justify-center items-center relative text-white w-full">
                {/* Dynamic Background with Overlay */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/80" />
                    <div className="absolute inset-0 bg-[url('/stadium.jpg')] bg-cover bg-center mix-blend-overlay" />
                    {/* Animated Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-gray-900/30 animate-gradient" />
                </div>

                {/* Content Container */}
                <div className="relative z-10 container mx-auto px-4">
                    <div className="w-full flex items-center justify-center flex-col lg:flex-row lg:justify-between gap-8">
                        {/* Text Content */}
                        <div className="w-full flex flex-col justify-center mx-8 my-16 md:my-24 lg:my-28">
                            <div className="flex flex-col w-full m-auto justify-center text-left mt-10 gap-4 md:gap-8 xl:gap-10">
                                {/* Intro Description */}
                                <h1 className="text-xl sm:text-xl md:text-5xl xl:text-6xl 2xl:text-7xl font-bold lg:leading-relaxed md:leading-16 xl:leading-20">
                                    Welcome to <br />Chriswrld Arena official Page
                                </h1>

                                {/* Enhanced Description */}
                                <p className="text-xs sm:text-lg md:text-xl text-gray-300 max-w-2xl xl:max-w-4xl">
                                    Join our elite community for expert predictions and data-driven insights that help turn your betting passion into consistent profits.
                                </p>

                            </div>

                            {/* Enhanced CTA Buttons */}
                            <div className="flex flex-col gap-4 pt-4 mt-8">
                                <Link
                                    href="/pricing"
                                    className="group relative overflow-hidden px-6 py-1.5 w-max rounded-lg  bg-yellow-500 text-black font-semibold text-center transform hover:scale-[1.02] transition-all duration-300"
                                >
                                    <span className="text-base md:text-lg lg:text-xl xl:text-2xl flex items-center justify-center gap-2">
                                        GET VIP GAMES
                                        <div className="absolute top-1 right-1">
                                            <div className="relative w-2 h-2">
                                                <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping" />
                                            </div>
                                        </div>
                                    </span>
                                </Link>
                                <Link
                                    href="https://t.me/Chriswrldarena1"
                                    target='_blank'
                                    className="group relative overflow-hidden px-6 py-1.5 w-max rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold text-center transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
                                >
                                    <span className="text-base md:text-lg lg:text-xl xl:text-2xl flex items-center justify-center gap-2">
                                        <svg className="size-4 md:size-8" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.227-.535.227l.19-2.712 4.94-4.465c.215-.19-.047-.296-.332-.106l-6.103 3.854-2.623-.816c-.57-.18-.582-.57.12-.843l10.238-3.948c.473-.174.887.104.605 1.337z" />
                                        </svg>
                                        JOIN TELEGRAM CHANNEL

                                    </span>
                                </Link>

                            </div>
                        </div>

                        <div className="hidden flex-col w-full lg:w-1/2 text-center lg:text-left space-y-8">
                            {/* Main Heading with Enhanced Typography */}
                            <div className="space-y-4">
                                {/* Stats Section */}
                                <div className="flex flex-wrap justify-between gap-4 pt-6">
                                    <div className="text-center">
                                        <p className="text-3xl xl:text-7xl font-extrabold text-white">95%</p>
                                        <p className=" xl:text-lg text-green-500">Success Rate</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl xl:text-7xl font-extrabold text-white">10K+</p>
                                        <p className="text-lg text-green-500">Happy Members</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl xl:text-7xl font-extrabold text-white">24/7</p>
                                        <p className=" xl:text-lg text-green-500">Expert Support</p>
                                    </div>
                                </div>
                            </div>

                            {/* Key Stats/Features Animation */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                                <div className="bg-green-950 backdrop-blur-sm p-4 rounded-xl border border-green-800 hover:border-green-900 transition-all duration-300 group hover:shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-white to-white/50 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm xl:text-lg font-semibold text-white">High Win Rate</h4>
                                            <p className="text-xs xl:text-sm text-neutral-300">95% success rate across all predictions</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-950 backdrop-blur-sm p-4 rounded-xl border border-green-800 hover:border-green-900 transition-all duration-300 group hover:shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-white to-white/50 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm xl:text-lg font-semibold text-white">Real-Time Updates</h4>
                                            <p className="text-xs xl:text-sm text-neutral-300">Instant notifications for all matches</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced CTA Buttons */}
                            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                                <Link
                                    href="https://t.me/Chriswrldarena1"
                                    target='_blank'
                                    className="group relative overflow-hidden px-4 py-3 w-max rounded-lg bg-yellow-500 text-black font-semibold text-center transform hover:scale-[1.02] transition-all duration-300"
                                >
                                    <span className="flex text-sm items-center justify-center gap-2">
                                        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.227-.535.227l.19-2.712 4.94-4.465c.215-.19-.047-.296-.332-.106l-6.103 3.854-2.623-.816c-.57-.18-.582-.57.12-.843l10.238-3.948c.473-.174.887.104.605 1.337z" />
                                        </svg>
                                        JOIN TELEGRAM CHANNEL
                                        <span className="absolute inset-0 flex justify-center items-center bg-black text-yellow-600 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                            CLICK TO JOIN OUR CHANNEL →
                                        </span>
                                    </span>
                                </Link>

                                <Link
                                    href="/pricing"
                                    className="group relative overflow-hidden px-4 py-2 w-max rounded-lg bg-yellow-500 text-black font-semibold text-center transform hover:scale-[1.02] transition-all duration-300"
                                >
                                    <span className="flex text-sm items-center justify-center gap-2">
                                        <svg className="size-7" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M2 8l4 10h12l4-10-6 5-4-7-4 7-6-5z" />
                                        </svg>
                                        GET VIP GAMES
                                        <div className="absolute top-1 right-1">
                                            <div className="relative w-2 h-2">
                                                <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping" />
                                            </div>
                                        </div>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section >

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

                        <div className="w-full ">
                            <div ref={parentRef} className="flex flex-col w-full xl:col-span-2 gap-16">
                                {/* VIP Predictions */}
                                {content.isSubscriptionActive && <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="p-6 bg-gradient-to-r from-green-950 to-green-950 border-b border-gray-200">
                                        <div className="relative flex flex-col lg:flex-row gap-4 items-center justify-between">
                                            <span className="absolute left-0 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500 text-gray-900">
                                                Premium
                                            </span>
                                            <h3 className="text-sm sm:text-xl font-bold text-white flex items-center gap-2 ml-20 uppercase">
                                                {title[0]?.defaulttitle || defaulttitles[0]}
                                                {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500 text-gray-900"
                                                    onClick={() => updateTableTitle(0, title[0]?.defaulttitle || defaulttitles[0])}>
                                                    <Edit2 className="size-4" />&nbsp;Edit
                                                </span>}
                                            </h3>

                                        </div>
                                    </div>
                                    <div className="">
                                        <div className=" bg-white rounded-xl overflow-hidden h-max">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {VIPGames
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
                                                                        {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Won ✓"}
                                                                        </span>}

                                                                        {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                            {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Lost ✗"}

                                                                        </span>}
                                                                        {prediction.result === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                            {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Pending ⏳"}

                                                                        </span>}
                                                                    </td>

                                                                    {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                        <td className="px-4 py-2 gap-2 items-center justify-center">
                                                                            <Popover>
                                                                                <PopoverTrigger className='flex' asChild>
                                                                                    <button
                                                                                        className=""
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
                                                                                            onClick={(e) => {
                                                                                                updateWLPrediction(index, prediction, 'WON');
                                                                                            }}
                                                                                        >
                                                                                            <Check className="w-4 h-4 text-neutral-500" />
                                                                                            Won
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={(e) => {
                                                                                                updateWLPrediction(index, prediction, 'LOST');
                                                                                            }}
                                                                                        >
                                                                                            <X className="w-4 h-4 text-neutral-500" />
                                                                                            Lost
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={(e) => {
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
                                                                                            onClick={(e) => deletePrediction(index, prediction.id)}
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
                                                {VIPGames.length < 1 && <h1 className="text-lg text-center">Empty List</h1>}

                                                <div className="flex items-center justify-center">
                                                    <Link
                                                        href="/pricing"
                                                        className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                                                    >
                                                        {content.isSubscriptionActive ? "View More VIP Matches" : !user ? "Sign in to View" : "Upgrade to VIP"}
                                                    </Link>
                                                    {user?.role === "ADMIN" && <Link
                                                        href={user ? "/dashboard/predictions/create" : "/signin"}
                                                        className=" text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                                                    >
                                                        <PlusCircle className='text-green-500 size-5 hover:text-gray-900' />
                                                        {!user && "Sign in to View"}
                                                    </Link>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>}

                                {/* Custom Predictions */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="relative p-6 bg-gradient-to-r from-green-950 to-green-950 border-b border-gray-200">
                                        <div className="relative flex flex-col lg:flex-row gap-4 items-center justify-between">
                                            <h3 className="text-sm sm:text-xl font-bold text-white flex uppercase justify-center gap-2 ">
                                                {title[1]?.defaulttitle || defaulttitles[1]}
                                                {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500 text-gray-900"
                                                    onClick={() => updateTableTitle(1, title[1]?.defaulttitle || defaulttitles[1])}>
                                                    <Edit2 className="size-4" />&nbsp;Edit
                                                </span>}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="">
                                        <div className=" bg-white rounded-xl overflow-hidden h-max">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prediction</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 bg-white">
                                                        {BetOfTheDayGames
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
                                                                        {prediction.result === "WON" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Won ✓"}
                                                                        </span>}

                                                                        {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                            {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Lost ✗"}

                                                                        </span>}
                                                                        {prediction.result === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                            {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Pending ⏳"}

                                                                        </span>}
                                                                    </td>


                                                                    {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                        <td className="px-4 py-2 gap-2 items-center justify-center">
                                                                            <Popover>
                                                                                <PopoverTrigger className='flex' asChild>
                                                                                    <button
                                                                                        className=""
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
                                                                                            onClick={(e) => {
                                                                                                updateWLPrediction(index, prediction, 'WON');
                                                                                            }}
                                                                                        >
                                                                                            <Check className="w-4 h-4 text-neutral-500" />
                                                                                            Won
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={(e) => {
                                                                                                updateWLPrediction(index, prediction, 'LOST');
                                                                                            }}
                                                                                        >
                                                                                            <X className="w-4 h-4 text-neutral-500" />
                                                                                            Lost
                                                                                        </button>
                                                                                        <button
                                                                                            className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                            onClick={(e) => {
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
                                                                                            onClick={(e) => deletePrediction(index, prediction.id)}
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
                                                {BetOfTheDayGames.length < 1 && <h1 className="text-lg text-center">Empty List</h1>}
                                                <div className="flex items-center justify-center ">
                                                    <Link
                                                        href="/predictions/custom"
                                                        className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300">
                                                        {"View More"}
                                                    </Link>
                                                    {user?.role === "ADMIN" && <Link
                                                        href={user ? "/dashboard/predictions/create" : "/signin"}
                                                        className=" text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                                                    >
                                                        <PlusCircle className='text-green-500 size-5 hover:text-gray-900' />

                                                    </Link>}
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>


                                {/* Previousely won odds */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="flex flex-col lg:flex-row gap-4 p-6 bg-gradient-to-r from-green-950 to-green-950 border-b border-gray-200">
                                        <h3 className="text-base sm:text-xl font-bold text-white flex uppercase items-center gap-2">
                                            {title[2]?.defaulttitle || defaulttitles[2]}
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500 text-gray-900"
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
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {PrevWonGames
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
                                                                    {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Won ✓"}
                                                                </span>}

                                                                {prediction.result === "LOST" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                    {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Lost ✗"}

                                                                </span>}
                                                                {prediction.result === "PENDING" && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    {updating && index === currentposition ? <LoaderCircle className="animate-spin size-4" /> : "Pending ⏳"}

                                                                </span>}
                                                            </td>

                                                            {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                <td className="px-4 py-2 gap-2 items-center justify-center">

                                                                    <Popover>
                                                                        <PopoverTrigger className='flex' asChild>
                                                                            <button
                                                                                className=""
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
                                                                                    onClick={(e) => {
                                                                                        updateWLPrediction(index, prediction, 'WON');
                                                                                    }}
                                                                                >
                                                                                    <Check className="w-4 h-4 text-neutral-500" />
                                                                                    Won
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={(e) => {
                                                                                        updateWLPrediction(index, prediction, 'LOST');
                                                                                    }}
                                                                                >
                                                                                    <X className="w-4 h-4 text-neutral-500" />
                                                                                    Lost
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={(e) => {
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
                                                                                    onClick={(e) => deletePrediction(index, prediction.id)}
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
                                        {PrevWonGames.length < 1 && <h1 className="text-lg text-center">Empty List</h1>}
                                        <div className="flex items-center justify-center ">
                                            <Link
                                                href="/predictions/previousgames"
                                                className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300">
                                                {"View More"}
                                            </Link>
                                            {user?.role === "ADMIN" && <Link
                                                href={user ? "/dashboard/predictions/create" : "/signin"}
                                                className=" text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                                            >
                                                <PlusCircle className='text-green-500 size-5 hover:text-gray-900' />
                                            </Link>}
                                        </div>
                                    </div>
                                </div>

                                {/* Free Hot Odds */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="flex flex-col lg:flex-row gap-4 p-6 bg-gradient-to-r from-green-950 to-green-950 border-b border-gray-200">
                                        <h3 className="text-base sm:text-xl font-bold text-white uppercase flex items-center gap-2">
                                            {title[3]?.defaulttitle || defaulttitles[3]}
                                            {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500 text-gray-900"
                                                onClick={() => updateTableTitle(3, title[3]?.defaulttitle || defaulttitles[3])}>
                                                <Edit2 className="size-4" />&nbsp;Edit
                                            </span>}
                                        </h3>


                                    </div>
                                    <div className="p-0">
                                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                                            <div className="space-y-3">
                                                {FreeGames
                                                    .slice(0, 5)
                                                    .map((bet, index) => (
                                                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-green-200 px-2">
                                                            <div className='ml-2'>
                                                                <p className="font-thin text-gray-900"></p>
                                                                <p className="text-xs sm:text-sm font-medium text-gray-900"> <span className='text-green-700'>{bet.league} &bull; <br /> </span>{bet.homeTeam} vrs {bet.awayTeam}</p>
                                                                <p className="text-xs sm:text-sm text-gray-600">{bet.tip}</p>
                                                            </div>
                                                            <div className="px-4 py-2 whitespace-nowrap">
                                                                {updating && index === currentposition && <LoaderCircle className="animate-spin size-4" />}
                                                            </div>
                                                            <div className="flex items-center text-right gap-1">
                                                                <div className="">
                                                                    <p className="font-bold text-green-600"><span className='text-neutral-500 text-sm font-normal'>Odd: </span>{bet.odds}</p>
                                                                    <p className="text-sm text-gray-500">{moment(bet.publishedAt).format("LLL")}</p>
                                                                </div>
                                                                {predictions.length > 0 && user?.role === "ADMIN" && !loading &&
                                                                    <Popover>
                                                                        <PopoverTrigger className='flex' asChild>
                                                                            <button
                                                                                className=""
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
                                                                                    onClick={(e) => {
                                                                                        updateWLPrediction(index, bet, 'WON');
                                                                                    }}
                                                                                >
                                                                                    <Check className="w-4 h-4 text-neutral-500" />
                                                                                    Won
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={(e) => {
                                                                                        updateWLPrediction(index, bet, 'LOST');
                                                                                    }}
                                                                                >
                                                                                    <X className="w-4 h-4 text-neutral-500" />
                                                                                    Lost
                                                                                </button>
                                                                                <button
                                                                                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                                    onClick={(e) => {
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
                                                                                    onClick={(e) => deletePrediction(index, bet.id)}
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
                                                    {FreeGames.length < 1 && <h1 className="text-lg text-center">Empty List</h1>}
                                                    <Link
                                                        href="/predictions/freegames"
                                                        className="px-4 py-2 underline underline-offset-4 text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300">
                                                        {"View More"}
                                                    </Link>
                                                    {user?.role === "ADMIN" && <Link
                                                        href={user ? "/dashboard/predictions/create" : "/signin"}
                                                        className=" text-sm font-medium text-gray-900 hover:text-green-600 transition-all duration-300"
                                                    >
                                                        <PlusCircle className='text-green-500 size-5 hover:text-gray-900' />
                                                    </Link>}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Midnight Oracle */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 h-max">
                                    <div className="p-6 bg-gradient-to-r  from-green-950 to-green-950 border-b border-gray-200">
                                        <h3 className="text-xs sm:text-xl font-bold text-white flex items-center gap-2">
                                            {user?.role === "ADMIN" && <span className="inline-flex cursor-pointer items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500 text-gray-900"
                                                onClick={() => updateTableTitle(4, title[4]?.defaulttitle || defaulttitles[4])}>
                                                <Edit2 className="size-4" />&nbsp;Edit
                                            </span>}
                                            {title[4]?.defaulttitle || defaulttitles[4]}
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {new Date().getHours() >= 0 && new Date().getHours() < 5 ? 'Active' : 'Returns at Midnight'}
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {new Date().getHours() >= 0 && new Date().getHours() < 5 ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                        <p className="text-xs sm:text-lg font-medium text-green-900">Special Midnight Predictions</p>
                                                    </div>
                                                    <table className="w-full mt-4">
                                                        <thead className="bg-green-100/50">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-900">Match</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-900">Prediction</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-900">Odds</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-green-100">
                                                            {predictions
                                                                .filter((bet) => bet.result === "PENDING" && bet.isFree && bet.isCustom)
                                                                .slice(0, 5).map((game, index) => (
                                                                    <tr key={index}>
                                                                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">{game.homeTeam} vrs {game.awayTeam} <br /> {moment(game.publishedAt).format("LLL")}</td>
                                                                        <td className="px-4 py-3 text-xs sm:text-sm text-gray-900">{game.tip}</td>
                                                                        <td className="px-4 py-3 text-xs sm:text-sm font-medium text-green-700">{game.odds}</td>
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
                                                <p className="text-xs sm:text-sm text-green-600 mt-2">Returns in {23 - new Date().getHours()} hours - {60 - new Date().getMinutes()} mins</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* TODO: duplicate to make adds */}
                        </div>
                    </div>
                </div>
            </section >


            {/* Features Section */}
            <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent,rgba(20,184,166,0.05)_20%,rgba(20,184,166,0)_80%)]" />
                    <div className="absolute w-full h-full bg-[radial-gradient(#14b8a650_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>

                {/* Content Container */}
                <div className="relative container mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-green-200 to-green-400 inline-block mb-4">
                            Why Choose Our Platform
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto text-base sm:text-lg">
                            Experience the perfect blend of expert analysis, cutting-edge technology, and community-driven success
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature Card 1 */}
                        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                    Expert Analysis
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Benefit from our team of seasoned analysts who provide detailed insights and predictions based on comprehensive research.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 2 */}
                        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                    Real-Time Updates
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Stay ahead with instant notifications and live updates on the latest predictions and match insights.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 3 */}
                        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                    VIP Community
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Join an exclusive community of successful bettors and get access to premium predictions and strategies.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 4 */}
                        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                    Data-Driven Insights
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Make informed decisions with our comprehensive statistical analysis and performance metrics.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 5 */}
                        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                    Early Access
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Get predictions before the crowd and maximize your winning potential with early insights.
                                </p>
                            </div>
                        </div>

                        {/* Feature Card 6 */}
                        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="w-12 h-12 mb-4 bg-green-500/10 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                                    24/7 Support
                                </h3>
                                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                                    Get assistance anytime with our dedicated support team ready to help you succeed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-16 text-center">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center px-8 py-3 text-base font-medium text-black bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-yellow-500/25"
                        >
                            Explore VIP Features
                            <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
                <div className="absolute bottom-10 right-10 w-20 h-20 border-2 border-green-200 rounded-lg rotate-45 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            </section>

            {/* Enhanced CTA Section with Animated Elements */}
            <section className="relative py-20 overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
                    <div className="absolute inset-0 bg-[url('/stadium.jpg')] bg-cover bg-center opacity-5" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
                    <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-yellow-500/10 to-transparent" />
                </div>

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-80 h-80 border border-yellow-500/10 rounded-full animate-spin-slow" />
                    <div className="absolute top-0 right-0 w-64 h-64 border border-yellow-500/20 rounded-full animate-reverse-spin" />
                    <div className="absolute bottom-20 left-1/2 w-40 h-40 border border-yellow-500/10 rounded-full animate-pulse" />
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-5xl mx-auto text-center">
                        {/* Animated Heading */}
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                            Transform Your
                            <span className="relative inline-block px-2">
                                <span className="relative z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                                    Predictions
                                </span>
                                <div className="absolute inset-0 bg-yellow-400/20 blur-2xl animate-pulse" />
                            </span>
                            Into Profit
                        </h2>

                        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Join our elite community of successful bettors and unlock expert predictions
                            that consistently deliver results.
                        </p>

                        {/* Enhanced CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link href="/signup"
                                className="group relative px-8 py-4 text-lg font-semibold text-black rounded-xl overflow-hidden transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-300 group-hover:scale-105" />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                                </div>
                                <span className="relative flex items-center gap-2">
                                    Start Winning Now
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </Link>

                            <Link href="/pricing"
                                className="group relative px-8 py-4 text-lg font-semibold text-white rounded-xl overflow-hidden transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-white/10 border border-white/30 transition-all duration-300 group-hover:bg-white/20" />
                                <span className="relative flex items-center gap-2">
                                    View Premium Plans
                                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </span>
                            </Link>
                        </div>


                    </div>
                </div>
            </section>

            {/* Enhanced Contact Section */}
            <section className="relative py-10">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(184, 168, 20, 0.1),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[linear-gradient(40deg,transparent,rgba(20,184,166,0.05)_20%,rgba(20,184,166,0)_80%)]" />
                    <div className="absolute w-full h-full bg-[radial-gradient(#14b8a650_1px,transparent_1px)] bg-[size:20px_20px]" />
                </div>
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                            <div className="absolute inset-0  rounded-2xl" />
                            <div className="relative">
                                <h2 className="text-4xl md:text-5xl font-bold lg:font-extrabold text-green-900 mb-8 text-center uppercase">Connect With Us</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { title: "phone", label: "Call Us", href: "tel:+233 24 064 6729", icon: <Phone className="size-6 text-black" /> },
                                        { title: "mail", label: "Email", href: "mailto:chriswrld95@gmail.com", icon: <Mail className="size-6 text-black" /> },
                                        { title: "telegram", label: "Telegram", href: "https://t.me/Chriswrldarena1", icon: <FaTelegram className="size-6 text-black" /> },
                                        { title: "twitter", label: "Twitter", href: "https://x.com/chriswrld233", icon: <FaTwitter className="size-6 text-black" /> }
                                    ].map((contact, index) => (
                                        <a key={index}
                                            href={contact.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex flex-col items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
                                        >
                                            <div className="w-12 h-12 mb-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 hover:to-yellow-600 flex items-center justify-center">
                                                {contact.icon}
                                            </div>
                                            <span className="text-sm text-neutral-500 group-hover:text-neutral-700 transition-colors">
                                                {contact.label}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


        </div >
    )
}

export default HomePageComponent

