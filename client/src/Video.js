import React, { useEffect, useRef } from 'react'

export default function Video({ srcObject, ...props }) {
    const refVideo = useRef()

    useEffect(() => {
        if (!refVideo.current) return
        refVideo.current.srcObject = srcObject
    }, [srcObject])

    return <video ref={refVideo} {...props} />
}