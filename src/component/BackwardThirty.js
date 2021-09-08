import React from 'react'
import { MdReplay30 } from 'react-icons/md'

const BackwardThirty = ({backwardThirty}) => {
    return (
        <button
            className="backward-30"
            onClick={backwardThirty}
        >
            <MdReplay30 />
      </button>
    )
}

export default BackwardThirty
