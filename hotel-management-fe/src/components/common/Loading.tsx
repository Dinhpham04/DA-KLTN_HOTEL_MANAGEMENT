import type React from 'react'

const Loading: React.FC = () => {
  return (
    <div className="top-0 left-0 z-50 fixed flex justify-center items-center bg-white bg-opacity-60 w-full h-full">
      <div className="animate-spin gradient-circle" />
    </div>
  )
}

export default Loading
