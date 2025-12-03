import React from 'react';

export const IframeApp = () => {
  return (
    <div className='modal-overlay' role='dialog' aria-modal='true'>
      <div className='modal'>
        <h2 className='modal-title'>Approve Modal</h2>
        <p className='modal-subtitle'>Sample text</p>
        <div className='modal-actions'>
          <button
            className='modal-button modal-button-approve'
            type='button'
            id='approve-modal-approve'
          >
            Approve
          </button>
          <button
            className='modal-button modal-button-reject'
            type='button'
            id='approve-modal-reject'
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};
