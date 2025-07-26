import Image from "next/image"
import Link from "next/link"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

interface BlogCardProps {
  title: string
  description: string
  imageUrl: string
  slug: string
  authorName: string
  authorImageUrl?: string
}

export function BlogCard({ title, description, imageUrl, slug, authorName, authorImageUrl }: BlogCardProps) {
  return (
    <div className="border border-white bg-[#0618F3] text-white h-full flex flex-col">
      <Link href={`/essays/${slug}`}>
        <div className="relative w-full">
          <div className="w-full h-52">
            <figure className="aspect-[16/9] relative h-full overflow-hidden w-full">
              <ImageWithFallback
                src={imageUrl}
                alt={title}
                fill={true}
                className="object-cover"
                priority
              />
            </figure>
          </div>
        </div>
      </Link>
      <div className="p-6 pt-1 space-y-5 flex-grow flex flex-col justify-between">
        <Link href={`/essays/${slug}`} className="block space-y-4">
          <h3 className="text-xl font-semibold hover:underline leading-relaxed">{title}</h3>
          <p className="text-sm leading-relaxed">{description}</p>
        </Link>
        <div className="flex items-center space-x-2 pt-4">
          {authorImageUrl ? (
            <Image
              src={authorImageUrl || "/placeholder.svg"}
              alt={authorName}
              width={28}
              height={28}
              className="bg-white rounded-full"
            />
          ) : (
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="h-7 w-7">
                <img className="inline-block h-7 w-7" alt="Infinite Runway" src="/images/logo.png" style={{border: "1px solid rgb(0, 25, 253)"}} />
              </div>
            </div>
          )}
          <span className="text-sm font-semibold">{authorName}</span>
        </div>
      </div>
    </div>
  )
}
