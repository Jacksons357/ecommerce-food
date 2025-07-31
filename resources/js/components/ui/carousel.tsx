import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CarouselItem {
  id: number | string
  image: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

interface CarouselProps {
  items: CarouselItem[]
  height?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
  showPlayPause?: boolean
  className?: string
}

export function Carousel({
  items,
  height = "h-96",
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  showPlayPause = true,
  className,
}: CarouselProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(autoPlay)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const nextSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % items.length)
  }, [items.length])

  const prevSlide = React.useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  const goToSlide = React.useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const togglePlayPause = React.useCallback(() => {
    setIsPlaying((prev) => !prev)
  }, [])

  // Auto-play functionality
  React.useEffect(() => {
    if (!isPlaying || !autoPlay) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, autoPlay, autoPlayInterval, nextSlide])

  // Pause auto-play on hover
  const handleMouseEnter = React.useCallback(() => {
    if (autoPlay && isPlaying) {
      setIsPlaying(false)
    }
  }, [autoPlay, isPlaying])

  const handleMouseLeave = React.useCallback(() => {
    if (autoPlay) {
      setIsPlaying(true)
    }
  }, [autoPlay])

  if (items.length === 0) {
    return null
  }

  return (
    <div 
      className={cn("relative overflow-hidden rounded-lg", height, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={items[currentSlide].image}
            alt={items[currentSlide].title || `Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Content overlay */}
          {(items[currentSlide].title || items[currentSlide].description) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                {items[currentSlide].title && (
                  <motion.h1
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg"
                  >
                    {items[currentSlide].title}
                  </motion.h1>
                )}
                {items[currentSlide].description && (
                  <motion.p
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-lg max-w-2xl mx-auto"
                  >
                    {items[currentSlide].description}
                  </motion.p>
                )}
                {items[currentSlide].actionText && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <Button
                      size="lg"
                      onClick={items[currentSlide].onAction}
                      className="bg-red-700 hover:bg-red-800 text-neutral-100 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      {items[currentSlide].actionText}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation controls */}
      {showControls && items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        </>
      )}

      {/* Play/Pause button */}
      {showPlayPause && autoPlay && items.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-white" />
          )}
        </Button>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 hover:scale-125",
                index === currentSlide
                  ? "bg-white shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
          {currentSlide + 1} / {items.length}
        </div>
      )}
    </div>
  )
} 