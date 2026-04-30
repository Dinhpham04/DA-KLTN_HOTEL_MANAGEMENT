import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import React, { useImperativeHandle, useState } from 'react'

type CustomPdfOpenTypes = {
  _?: never
}

export type CustomPdfOpenMethods = {
  open: (url: string) => void
}

const CustomPdfOpenComponent = React.forwardRef<CustomPdfOpenMethods, CustomPdfOpenTypes>(
  (_, ref) => {
    const [url, setUrl] = useState<string>()
    const [open, setOpen] = useState<boolean>(false)

    useImperativeHandle(ref, () => ({
      open: (nextUrl) => {
        setUrl(nextUrl)
        setOpen(true)
      },
    }))

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[52rem]">
          <DialogHeader>
            <DialogTitle>Tạo file PDF đã hoàn tất. Mở ở tab mới?</DialogTitle>
            <DialogDescription className="hidden" />
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-3 sm:justify-center">
            <Button
              className="w-[12.4rem] bg-[#8bd08e] text-black hover:bg-[#7cc17f]"
              onClick={() => {
                if (url) window.open(url, '_blank', 'noopener,noreferrer')
                setOpen(false)
              }}
            >
              OK
            </Button>
            <Button
              variant="outline"
              className="w-[12.4rem]"
              onClick={() => {
                setOpen(false)
                setUrl(undefined)
              }}
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
)

CustomPdfOpenComponent.displayName = 'CustomPdfOpenComponent'

export default CustomPdfOpenComponent
