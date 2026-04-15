import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type ReactNode, useEffect, useState } from 'react'
import { CloseSVG } from '../svgs/CloseSVG'

interface DialogType {
  title: string | ReactNode
  size?: 'small' | 'medium' | 'large' | 'max'
  content: ReactNode | null
  customClass?: string
  customClassContent?: string
  disableOverflow?: boolean
  trigger: ReactNode
  opened?: boolean
  changeOnOpened?: (e: boolean) => void
  onClose?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const CustomDialog: React.FC<DialogType> = ({
  content,
  trigger,
  size,
  title,
  customClass,
  customClassContent,
  disableOverflow = false,
  opened,
  changeOnOpened,
  onClose,
}) => {
  const handleSize = () => {
    switch (size) {
      case 'max':
        return 'max-w-[calc(40rem+4rem)]'
      case 'small':
        return 'max-w-[calc(79rem+4rem)]'
      case 'medium':
        return 'max-w-[calc(100rem+4rem)]'
      case 'large':
        return 'max-w-[calc(120rem+4rem)]'
      default:
        return 'common-container'
    }
  }

  const [open, setOpen] = useState<boolean>()

  useEffect(() => {
    setOpen(opened)
  }, [opened])

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(e) => {
          if (changeOnOpened) {
            changeOnOpened(e)
          }
        }}
      >
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent
          onClick={(e) => e.stopPropagation()}
          className={cn(
            handleSize(),
            'border-none [&>button]:hidden outline-none mt-[4rem]',
            customClassContent
          )}
        >
          <div
            className={cn(
              'bg-white w-full py-16 relative rounded-[0.8rem] max-h-[calc(100dvh-17rem)]',
              customClass
            )}
          >
            {title && (
              <DialogTitle className="mb-8 px-8 lg:px-12 xl:px-16 font-bold text-[2.3rem] text-black leading-normal perspective-200">
                {title}
              </DialogTitle>
            )}

            <div
              id="content-wrapper"
              className={cn(
                'w-full max-h-[calc(100%-4rem)] px-8 lg:px-12 xl:px-16 py-4',
                disableOverflow ? '' : 'overflow-auto'
              )}
            >
              {content}
            </div>
            <DialogDescription className="hidden" />
            <DialogClose
              className="transition-all duration-300 close-btn hover:rotate-90"
              onClick={(e) => onClose?.(e)}
              asChild
            >
              <div
                className={cn(
                  'w-[2.6rem] h-[2.6rem] top-[2.4rem] right-[2.4rem] absolute z-10 cursor-pointer'
                )}
              >
                <CloseSVG />
              </div>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CustomDialog
