'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/navigation'

interface SlideContent {
  id: number
  image: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

const slides: SlideContent[] = [
  {
    id: 1,
    image: "/images/slider-1.webp",
    title: "slider.title1",
    description: "slider.description1",
    buttonText: "slider.button1",
    buttonLink: "/monasteries"
  },
  {
    id: 2,
    image: "/images/slider-2.webp",
    title: "slider.title2",
    description: "slider.description2",
    buttonText: "slider.button2",
    buttonLink: "/monasteries"
  },
  {
    id: 3,
    image: "/images/slider-3.jpg",
    title: "slider.title3",
    description: "slider.description3",
    buttonText: "slider.button3",
    buttonLink: "/my-donations"
  },
  {
    id: 4,
    image: "/images/slider-4.jpg",
    title: "slider.title4",
    description: "slider.description4",
    buttonText: "slider.button4",
    buttonLink: "/monasteries"
  }
]

export function ContentSlider() {
  const t = useTranslations('HomePage')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const prevSlide = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return
    setIsAnimating(true)
    setCurrentSlide(index)
    setTimeout(() => setIsAnimating(false), 500)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-2xl my-12 group">
      {/* Background Images */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/30 hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] backdrop-blur-sm rounded-full text-white transition-all duration-300 hover:scale-125 hover:shadow-lg hover:shadow-[var(--primary-color)]/30 hover:shadow-2xl active:scale-95 active:shadow-md opacity-0 group-hover:opacity-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/30 hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] backdrop-blur-sm rounded-full text-white transition-all duration-300 hover:scale-125 hover:shadow-lg hover:shadow-[var(--primary-color)]/30 hover:shadow-2xl active:scale-95 active:shadow-md opacity-0 group-hover:opacity-100 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:ring-offset-2 focus:ring-offset-transparent"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Content - Right side only */}
      <div className="absolute inset-0 flex items-center justify-end">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute right-0 top-1/2 -translate-y-1/2 text-right text-white p-8 md:p-12 max-w-md md:max-w-lg lg:max-w-xl transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight transition-all duration-1000 delay-200 ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-100 translate-x-4'
            }">
              {t(slide.title)}
            </h2>
            <p className={`text-base md:text-lg mb-6 text-white/90 leading-relaxed transition-opacity duration-1000 delay-400 ${
              index === currentSlide 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}>
              {t(slide.description)}
            </p>
            <Link href={slide.buttonLink}>
              <Button className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] hover:from-[var(--accent-color)] hover:to-[var(--primary-color)] text-white px-6 py-3 text-base md:text-lg rounded-full transition-all duration-1000 delay-600 transform hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary-color)]/30 active:scale-95 active:shadow-md ${
                index === currentSlide 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2'
              }">
                {t(slide.buttonText)}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] scale-125 shadow-lg shadow-[var(--primary-color)]/50' 
                : 'bg-white/50 hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] hover:shadow-md hover:shadow-[var(--primary-color)]/30 hover:scale-110 active:scale-95'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div 
          className="h-full bg-white transition-all duration-500 ease-linear"
          style={{ 
            width: `${((currentSlide + 1) / slides.length) * 100}%` 
          }}
        />
      </div>
    </section>
  )
}