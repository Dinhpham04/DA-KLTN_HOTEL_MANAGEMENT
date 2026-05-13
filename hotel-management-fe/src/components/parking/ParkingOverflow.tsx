import { cn } from '@/lib/utils'
import {
  type DetailedHTMLProps,
  Fragment,
  type HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react'

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  )
}

export default function ParkingOverflow({
  children,
  className,
  step = 100,
  customEndBorder,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  step?: number
  customEndBorder?: string
}) {
  const cellRef = useRef<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [scrollXPos, setScrollXPos] = useState<number>(0)
  const [fillFlag, setFillFlag] = useState<boolean>(false)
  const [childBreak, setChildBreak] = useState<HTMLDivElement[]>([])

  useEffect(() => {
    if (cellRef.current) {
      const { clientWidth, scrollWidth } = cellRef.current as HTMLDivElement
      if (clientWidth === scrollWidth) {
        setScrollXPos(-1)
      } else {
        setScrollXPos(0)
      }
    }
  }, [])

  useEffect(() => {
    const num = (wrapperRef.current as HTMLDivElement).childNodes.length
    setChildBreak(
      Array.from((wrapperRef.current as HTMLDivElement).childNodes).map((ele) => {
        const tmp = ele as HTMLDivElement
        return tmp
      })
    )
    const { offsetWidth } = cellRef.current as HTMLDivElement
    if (!(num - 1)) {
      setFillFlag(false)
      return
    }
    setFillFlag(num * step >= offsetWidth ? false : true)
  }, [children, step])

  function handleScroll(isRight?: boolean) {
    const cellEle = cellRef.current as HTMLDivElement
    const anchor = cellEle.scrollLeft
    let tmp = 0
    let res = 0

    for (let i = 0; i < childBreak.length - 1; i++) {
      if (anchor >= tmp + childBreak[i].offsetWidth) {
        res += 1
        tmp += childBreak[i].offsetWidth
      }
    }

    if (isRight) {
      childBreak[res + 1]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
      return
    }

    if (Math.floor(cellEle.scrollLeft) > (childBreak[res]?.offsetLeft ?? 0)) {
      childBreak[res]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    } else {
      childBreak[res - 1]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' })
    }
  }

  return (
    <Fragment>
      <div
        ref={cellRef}
        className={cn(
          'absolute top-0 left-0 right-0 bottom-0 overflow-x-auto flex no-scrollbar',
          className
        )}
        onScroll={(e) => {
          const { scrollLeft, clientWidth, scrollWidth } = e.target as HTMLDivElement
          if (!scrollLeft) {
            setScrollXPos(0)
            return
          }
          if (scrollLeft + clientWidth >= scrollWidth) {
            setScrollXPos(2)
            return
          }
          setScrollXPos(1)
        }}
        {...props}
      >
        <div
          className="h-[100%] min-w-[100%] flex [&>*:nth-last-child(2)]:!border-r-0"
          ref={wrapperRef}
        >
          {children}
          <div
            className={cn('flex-1 border-l border-l-black', customEndBorder, {
              'opacity-0': !fillFlag,
            })}
          />
        </div>
      </div>

      {/* Left arrow */}
      <div
        className={cn(
          'absolute w-[2.5rem] top-0 left-0 bottom-0 bg-[rgba(0,0,0,0)]',
          'flex justify-center items-center opacity-0 hover:opacity-100',
          { hidden: !scrollXPos || scrollXPos === -1 }
        )}
        style={{ transition: '.5s' }}
      >
        <button
          type="button"
          className="h-[2rem] w-[2rem] bg-black text-white flex justify-center items-center rounded-[1rem]"
          onClick={() => handleScroll()}
        >
          <ArrowIcon className="w-[2rem] h-[2rem]" />
        </button>
      </div>

      {/* Right arrow */}
      <div
        className={cn(
          'absolute w-[2.5rem] top-0 right-0 bottom-0 bg-[rgba(0,0,0,0)]',
          'flex justify-center items-center opacity-0 hover:opacity-100',
          { hidden: scrollXPos === 2 || scrollXPos === -1 }
        )}
        style={{ transition: '.5s', transform: 'rotate(180deg)' }}
      >
        <button
          type="button"
          className="h-[2rem] w-[2rem] bg-black text-white flex justify-center items-center rounded-[1rem]"
          onClick={() => handleScroll(true)}
        >
          <ArrowIcon className="w-[2rem] h-[2rem]" />
        </button>
      </div>
    </Fragment>
  )
}
