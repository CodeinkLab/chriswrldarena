'use client'
import { useDialog } from '@/app/components/shared/dialog'
import { useAuth } from '@/app/contexts/AuthContext'
import { Prediction } from '@/app/lib/interface'
import { Popover, PopoverTrigger, PopoverContent } from '@radix-ui/react-popover'
import { Check, Clock, Edit, LoaderCircle, MoreVertical, Trash, X } from 'lucide-react'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


const PredictionComponent = ({ content, title }: { content: Prediction[], title: string }) => {
    const router = useRouter()
    const { user } = useAuth()
    const dialog = useDialog()
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const predictionsPerPage = 25;
    const pageSize = predictions.length;
    const totalPages = Math.ceil(pageSize / predictionsPerPage);
    const startIndex = (currentPage - 1) * predictionsPerPage;
    const endIndex = startIndex + predictionsPerPage;
    const currentPredictions = predictions.slice(startIndex, endIndex);
    const [updating, setUpdating] = useState<boolean>(false);
    const [currentposition, setCurrentPosition] = useState<number>(-1);
    const [loading, setLoading] = useState(false)


    useEffect(() => {
        setPredictions(content)
    }, [content])

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
        <div className="relative mx-auto px-4 py-12">
            <div className="absolute inset-0 bg-cover bg-center h-64 shadow-lg -z-20"
                style={{
                    backgroundImage: 'linear-gradient(to right, #1a1818c0, #111010cb), url(/stadium.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>

            </div>
            <div className="container mx-auto mt-28 z-50">
                <h1 className="text-4xl font-bold mb-20 text-white">{title.toUpperCase() || "No category specified"}</h1>
            </div>


            <div className="container mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-max">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {title}
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {currentPredictions
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
                                        <td className="px-6 py-2 whitespace-nowrap " title={prediction.analysis}>
                                            <Popover>
                                                <PopoverTrigger className='max-w-lg w-full' asChild>
                                                    <p className="max-w-xs truncate">{prediction.analysis}</p>

                                                </PopoverTrigger>
                                                <PopoverContent align="center" className=" h-auto w-md bg-white z-50 rounded-lg shadow-lg border-2 border-neutral-300 p-4 outline-0">
                                                    <p className="whitespace-pre-wrap">{prediction.analysis}</p>
                                                </PopoverContent>
                                            </Popover>
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
                                            <td className="relative my-auto px-6 py-2 flex gap-2 items-center justify-center">

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
                                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md hover:bg-orange-700 disabled:opacity-50"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default PredictionComponent