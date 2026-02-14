interface SectionHeadingProps {
  title: string
}

export default function SectionHeading({ title }: SectionHeadingProps) {
  return (
    <div className="flex items-center mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-merriweather pr-4 whitespace-nowrap">
        {title}
      </h2>
      <div className="flex-1 h-1 bg-orange-600"></div>
    </div>
  )
}
