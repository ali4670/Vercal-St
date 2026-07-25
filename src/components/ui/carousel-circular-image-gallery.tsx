"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useTheme } from "@/lib/ThemeContext"

interface ImageData {
  title: string
  description: string
  url: string
}

const images: ImageData[] = [
  {
    title: "All Kids Participating",
    description: "Building the future, one robot at a time",
    url: "/PHOTOS/all the kids partcpating.jpeg",
  },
  {
    title: "Team in Action",
    description: "Young engineers collaborating on their build",
    url: "/PHOTOS/Jo with he kids.jpeg",
  },
  {
    title: "Kids Planning",
    description: "Where ideas take shape before the build begins",
    url: "/PHOTOS/KIDS PLANING.jpeg",
  },
  {
    title: "Playing Robot",
    description: "The moment code meets creation",
    url: "/PHOTOS/PLAYING ROBOTjpeg.jpeg",
  },
]

declare global {
  interface Window {
    gsap: any
    MotionPathPlugin: any
  }
}

export function ImageGallery() {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [opened, setOpened] = useState(0)
  const [inPlace, setInPlace] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [gsapReady, setGsapReady] = useState(false)
  const [textVisible, setTextVisible] = useState(false)
  const autoplayTimer = useRef<number | null>(null)

  useEffect(() => {
    const loadScripts = () => {
      if (window.gsap && window.MotionPathPlugin) {
        window.gsap.registerPlugin(window.MotionPathPlugin)
        setGsapReady(true)
        return
      }

      const gsapScript = document.createElement("script")
      gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
      gsapScript.onload = () => {
        const motionPathScript = document.createElement("script")
        motionPathScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js"
        motionPathScript.onload = () => {
          if (window.gsap && window.MotionPathPlugin) {
            window.gsap.registerPlugin(window.MotionPathPlugin)
            setGsapReady(true)
          }
        }
        document.body.appendChild(motionPathScript)
      }
      document.body.appendChild(gsapScript)
    }

    loadScripts()
  }, [])

  const onClick = (index: number) => {
    if (!disabled) setOpened(index)
  }

  const onInPlace = (index: number) => setInPlace(index)

  const next = useCallback(() => {
    setOpened((currentOpened) => {
      let nextIndex = currentOpened + 1
      if (nextIndex >= images.length) nextIndex = 0
      return nextIndex
    })
  }, [])

  const prev = useCallback(() => {
    setOpened((currentOpened) => {
      let prevIndex = currentOpened - 1
      if (prevIndex < 0) prevIndex = images.length - 1
      return prevIndex
    })
  }, [])

  useEffect(() => setDisabled(true), [opened])
  useEffect(() => {
    setTextVisible(false)
    const timer = setTimeout(() => setTextVisible(true), 200)
    return () => clearTimeout(timer)
  }, [inPlace])

  useEffect(() => {
    if (!gsapReady) return

    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current)
    }

    autoplayTimer.current = window.setInterval(next, 4500)

    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current)
      }
    }
  }, [opened, gsapReady, next])

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[120px] transition-colors duration-700"
          style={{ backgroundColor: isDark ? "rgba(112,224,0,0.05)" : "rgba(112,224,0,0.12)" }}
        />
        <div
          className="absolute bottom-[-15%] right-[-5%] w-[400px] h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-[100px] transition-colors duration-700"
          style={{ backgroundColor: isDark ? "rgba(0,165,207,0.03)" : "rgba(0,165,207,0.06)" }}
        />
        <div
          className="absolute top-[40%] left-[60%] w-[250px] h-[250px] md:w-[300px] md:h-[300px] rounded-full blur-[80px] transition-colors duration-700"
          style={{ backgroundColor: isDark ? "rgba(112,224,0,0.03)" : "rgba(112,224,0,0.08)" }}
        />
      </div>

      {/* Grain overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-700"
        style={{
          opacity: isDark ? 0.03 : 0.02,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-12 px-4 py-16 md:py-24 w-full max-w-7xl mx-auto">
        {/* Eyebrow */}
        <div className="flex items-center gap-3">
          <div className="h-px w-8 transition-colors duration-700" style={{ backgroundColor: isDark ? "rgba(112,224,0,0.5)" : "rgba(92,184,0,0.5)" }} />
          <span
            className="text-[10px] uppercase tracking-[0.25em] font-medium transition-colors duration-700"
            style={{ color: isDark ? "rgba(112,224,0,0.7)" : "rgba(92,184,0,0.7)" }}
          >
            Gallery
          </span>
          <div className="h-px w-8 transition-colors duration-700" style={{ backgroundColor: isDark ? "rgba(112,224,0,0.5)" : "rgba(92,184,0,0.5)" }} />
        </div>

        {/* Title */}
        <div className="text-center max-w-2xl">
          <h2
            className="text-3xl md:text-6xl font-bold tracking-tight leading-[1.1] transition-colors duration-700"
            style={{ color: "var(--foreground)" }}
          >
            Moments from the
            <span className="block mt-1" style={{ color: "var(--primary)" }}>Club</span>
          </h2>
          <p
            className="mt-4 md:mt-5 text-xs md:text-base font-light leading-relaxed max-w-md mx-auto transition-colors duration-700"
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(13,31,0,0.5)" }}
          >
            Snapshots of young engineers designing, building, and bringing robots to life.
          </p>
        </div>

        {/* Carousel area */}
        <div className="flex items-center gap-3 md:gap-10 w-full justify-center">
          {/* Prev button */}
          <button
            onClick={prev}
            disabled={disabled}
            className="group flex-shrink-0 h-10 w-10 md:h-14 md:w-14 rounded-full border backdrop-blur-sm flex items-center justify-center outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            }}
            aria-label="Previous Image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-500" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Double-bezel carousel container */}
          <div className="relative flex-shrink-0">
            {/* Outer shell */}
            <div
              className="p-[2px] md:p-[3px] rounded-[20px] md:rounded-[24px] transition-colors duration-700"
              style={{
                background: isDark
                  ? "linear-gradient(to bottom right, rgba(255,255,255,0.08), transparent, rgba(112,224,0,0.06))"
                  : "linear-gradient(to bottom right, rgba(0,0,0,0.08), transparent, rgba(92,184,0,0.1))",
              }}
            >
              {/* Inner core */}
              <div
                className="relative h-[65vw] w-[65vw] max-h-[450px] max-w-[450px] min-h-[260px] min-w-[260px] md:h-[50vmin] md:w-[50vmin] overflow-hidden rounded-[18px] md:rounded-[22px] transition-colors duration-700"
                style={{
                  backgroundColor: "var(--card)",
                  boxShadow: isDark
                    ? "0 0 80px rgba(112,224,0,0.06)"
                    : "0 0 80px rgba(112,224,0,0.08), 0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                {gsapReady &&
                  images.map((image, i) => (
                    <div
                      key={image.url}
                      className="absolute left-0 top-0 h-full w-full"
                      style={{ zIndex: inPlace === i ? i : images.length + 1 }}
                    >
                      <GalleryImage
                        total={images.length}
                        id={i}
                        url={image.url}
                        title={image.title}
                        open={opened === i}
                        inPlace={inPlace === i}
                        onInPlace={onInPlace}
                      />
                    </div>
                  ))}
                <div className="absolute left-0 top-0 z-[100] h-full w-full pointer-events-none">
                  <Tabs images={images} onSelect={onClick} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={next}
            disabled={disabled}
            className="group flex-shrink-0 h-10 w-10 md:h-14 md:w-14 rounded-full border backdrop-blur-sm flex items-center justify-center outline-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            }}
            aria-label="Next Image"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-500" style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)" }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 md:gap-2.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => onClick(i)}
              className="h-[3px] rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                width: i === opened ? 32 : 12,
                backgroundColor: i === opened
                  ? "var(--primary)"
                  : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
              }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>

        {/* Text below carousel */}
        <div
          className={`text-center max-w-md transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <p
            className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-semibold mb-2 transition-colors duration-700"
            style={{ color: "var(--primary)" }}
          >
            {String(opened + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
          <h3
            className="text-xl md:text-2xl font-bold leading-tight transition-colors duration-700"
            style={{ color: "var(--foreground)" }}
          >
            {images[inPlace]?.title}
          </h3>
          <p
            className="text-sm md:text-base font-light mt-1.5 transition-colors duration-700"
            style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(13,31,0,0.5)" }}
          >
            {images[inPlace]?.description}
          </p>
        </div>
      </div>
    </div>
  )
}

interface GalleryImageProps {
  url: string
  title: string
  open: boolean
  inPlace: boolean
  id: number
  onInPlace: (id: number) => void
  total: number
}

function GalleryImage({ url, title, open, inPlace, id, onInPlace, total }: GalleryImageProps) {
  const [firstLoad, setLoaded] = useState(true)
  const clip = useRef<SVGCircleElement>(null)

  const gap = 10
  const circleRadius = 7
  const defaults = { transformOrigin: "center center" }
  const duration = 0.4
  const width = 400
  const height = 400
  const scale = 700

  const bigSize = circleRadius * scale
  const overlap = 0

  const getPosSmall = () => ({
    cx: width / 2 - (total * (circleRadius * 2 + gap) - gap) / 2 + id * (circleRadius * 2 + gap),
    cy: height - 30,
    r: circleRadius,
  })
  const getPosSmallAbove = () => ({
    cx: width / 2 - (total * (circleRadius * 2 + gap) - gap) / 2 + id * (circleRadius * 2 + gap),
    cy: height / 2,
    r: circleRadius * 2,
  })
  const getPosCenter = () => ({ cx: width / 2, cy: height / 2, r: circleRadius * 7 })
  const getPosEnd = () => ({ cx: width / 2 - bigSize + overlap, cy: height / 2, r: bigSize })
  const getPosStart = () => ({ cx: width / 2 + bigSize - overlap, cy: height / 2, r: bigSize })

  useEffect(() => {
    const gsap = window.gsap
    if (!gsap) return

    setLoaded(false)
    if (clip.current) {
      const flipDuration = firstLoad ? 0 : duration
      const upDuration = firstLoad ? 0 : 0.2
      const bounceDuration = firstLoad ? 0.01 : 1
      const delay = firstLoad ? 0 : flipDuration + upDuration

      if (open) {
        gsap
          .timeline()
          .set(clip.current, { ...defaults, ...getPosSmall() })
          .to(clip.current, {
            ...defaults,
            ...getPosCenter(),
            duration: upDuration,
            ease: "power3.inOut",
          })
          .to(clip.current, {
            ...defaults,
            ...getPosEnd(),
            duration: flipDuration,
            ease: "power4.in",
            onComplete: () => onInPlace(id),
          })
      } else {
        gsap
          .timeline({ overwrite: true })
          .set(clip.current, { ...defaults, ...getPosStart() })
          .to(clip.current, {
            ...defaults,
            ...getPosCenter(),
            delay: delay,
            duration: flipDuration,
            ease: "power4.out",
          })
          .to(clip.current, {
            ...defaults,
            motionPath: {
              path: [getPosSmallAbove(), getPosSmall()],
              curviness: 1,
            },
            duration: bounceDuration,
            ease: "bounce.out",
          })
      }
    }
  }, [open])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <clipPath id={`${id}_circleClip`}>
          <circle className="clip" cx="0" cy="0" r={circleRadius} ref={clip}></circle>
        </clipPath>
        <clipPath id={`${id}_squareClip`}>
          <rect className="clip" width={width} height={height}></rect>
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}${inPlace ? "_squareClip" : "_circleClip"})`}>
        <image width={width} height={height} href={url} className="pointer-events-none"></image>
      </g>
    </svg>
  )
}

interface TabsProps {
  images: ImageData[]
  onSelect: (index: number) => void
  isDark: boolean
}

function Tabs({ images, onSelect, isDark }: TabsProps) {
  const gap = 10
  const circleRadius = 7
  const width = 400
  const height = 400

  const getPosX = (i: number) =>
    width / 2 - (images.length * (circleRadius * 2 + gap) - gap) / 2 + i * (circleRadius * 2 + gap)
  const getPosY = () => height - 30

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      {images.map((image, i) => (
        <g key={image.url} className="pointer-events-auto">
          <defs>
            <clipPath id={`tab_${i}_clip`}>
              <circle cx={getPosX(i)} cy={getPosY()} r={circleRadius} />
            </clipPath>
          </defs>
          <image
            x={getPosX(i) - circleRadius}
            y={getPosY() - circleRadius}
            width={circleRadius * 2}
            height={circleRadius * 2}
            href={image.url}
            clipPath={`url(#tab_${i}_clip)`}
            className="pointer-events-none"
            preserveAspectRatio="xMidYMid slice"
          />
          <circle
            onClick={() => onSelect(i)}
            className="cursor-pointer transition-all duration-300"
            fill="none"
            stroke={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)"}
            strokeWidth="2"
            cx={getPosX(i)}
            cy={getPosY()}
            r={circleRadius + 2}
          />
        </g>
      ))}
    </svg>
  )
}
