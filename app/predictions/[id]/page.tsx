import { Metadata } from 'next'
import PredictionComponent from './component'
import { homeData } from '@/app/actions/utils'
import { Prediction } from '@/app/lib/interface'
import { getData } from '@/app/lib/database'

export const metadata: Metadata = {
  title: 'Prediction Details | ChrisWrldArena',
  description: 'View detailed prediction analysis and tips',
}

export default async function PredictionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await homeData()
  const titles = await getData('title')
  let title = ""

  const defaulttitles = [
    "Vip Predictions",
    "Bet of the day",
    "Previously Won Matches",
    "Free Hot Odds",
    "Midnight Owl",
  ]

  const customgames = ['Bet of the Day', 'Correct Score', 'Draw Games']


  const filteredData: () => Prediction[] = () => {

    const sortedTitles = [...titles.data].sort(
      (a, b) =>
        defaulttitles.indexOf(a.defaulttitle.toLowerCase()) - defaulttitles.indexOf(b.defaulttitle.toLowerCase())
    );

    switch (id) {
      case 'freegames':
        title = sortedTitles[3].defaulttitle
        return data.predictions.filter((bet: Prediction) => bet.result === "PENDING" && bet.isFree);
      case 'custom':
        title = sortedTitles[1].defaulttitle
        return data.predictions.filter((bet: Prediction) => bet.result === "PENDING" && bet.isCustom && bet.isFree);
      case 'previousgames':
        title = sortedTitles[2].defaulttitle
        return data.predictions.filter((bet: Prediction) => bet.result !== "PENDING");
      default:
        title = "No Predictions Found for the Category"
        return []
    }
  }

  console.log("Filtered ID: ", id)


  return (
    <div className="mx-auto py-8">
      <PredictionComponent content={filteredData()} title={title} />
    </div>
  )
}
